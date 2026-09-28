import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

// This repository keeps its shared Node dependencies in client/package.json.
const require = createRequire(new URL('../client/package.json', import.meta.url));
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });

const imageTypes = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

export function validateEntry(body, kind) {
  if (typeof body?.name !== 'string' || !body.name.trim()) return `${kind} name is required`;
  if (body.name.trim().length > 120) return 'Name must be 120 characters or fewer';
  for (const [field, limit] of [['description', 2000], ['location', 200]]) {
    if (body[field] != null && (typeof body[field] !== 'string' || body[field].length > limit)) return `${field} must be text of ${limit} characters or fewer`;
  }
  if (body.image_url != null && body.image_url !== '') {
    try {
      const url = new URL(body.image_url);
      if (!['http:', 'https:'].includes(url.protocol)) return 'Image URL must use HTTP or HTTPS';
    } catch { return 'Image URL is invalid'; }
  }
  if (body.is_favorited !== undefined && typeof body.is_favorited !== 'boolean') return 'Favorite must be true or false';
  return null;
}

// Keep the original explicit routes; this wrapper allows tests to supply a mock database.
export function createApp(supabase) {
const app = express();
app.use(cors({origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'}));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const IMAGE_BUCKET = 'item-images';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

app.post('/api/uploads', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({error: 'No image file provided'});
  }

  const ext = imageTypes[req.file.mimetype];
  if (!ext) return res.status(400).json({error: 'Choose a JPG, PNG, WebP, or GIF image'});
  const buffer = req.file.buffer;
  const valid = req.file.mimetype === 'image/jpeg' ? buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
    : req.file.mimetype === 'image/png' ? buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    : req.file.mimetype === 'image/webp' ? buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP'
    : ['GIF87a', 'GIF89a'].includes(buffer.toString('ascii', 0, 6));
  if (!valid) return res.status(400).json({ error: 'The file does not match its image type' });

  const folder = req.query.kind === 'container' ? 'containers' : 'items';
  const filePath = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(filePath, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });

  if (error) return res.status(500).json({ error: error.message });

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(filePath);

  res.status(201).json({ url: data.publicUrl, path: filePath });
});

app.get('/api/containers', async (req, res) => {
  const containerResult = await supabase
    .from('containers')
    .select('*')
    .order('created_at', {ascending: true});

    const containers = containerResult.data;
    const error = containerResult.error;

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }


  const itemResult = await supabase
    .from('items')
    .select('id, container_id, image_url, name');

  const items = itemResult.data;
  const itemsError = itemResult.error;

  if (itemsError) {
    return res.status(500).json({
      error: itemsError.message
    });
  }

  const counts = {};
  const previews = {};
  for (const item of items) {
    if (!item.container_id) {
      continue;
    }

    counts[item.container_id] =
      (counts[item.container_id] || 0) + 1;
    previews[item.container_id] ||= [];
    if (item.image_url && previews[item.container_id].length < 3) {
      previews[item.container_id].push({url: item.image_url, name: item.name});
    }
  }

  
  const withCounts = containers.map((container) => ({
    ...container,
    item_count: counts[container.id] || 0,
    preview_images: previews[container.id] || [],
  }));

  
  res.status(200).json(withCounts);

})

app.get('/api/containers/:id', async (req, res) => {
  const id = req.params.id;

  const containerResult = await supabase
    .from('containers')
    .select('*')
    .eq('id', id)
    .single();

  const container = containerResult.data;
  const error = containerResult.error;

  if (error) {
    return res.status(404).json({error: 'Container not found'});
  }

  const itemsResult = await supabase
    .from('items')
    .select('*')
    .eq('container_id', id)
    .order('created_at', {ascending: true});

  const items = itemsResult.data;
  const itemsError = itemsResult.error;

  if (itemsError) {
    return res.status(500).json({error: itemsError.message});
  }

  res.json({
    ...container,
    item_count: items.length,
    items
  });
});


app.post('/api/containers', async (req, res) => {
  const name = req.body.name;
  const description = req.body.description;
  const location = req.body.location;
  const image_url = req.body.image_url;

  const validation = validateEntry(req.body, 'Container');
  if (validation) {
    return res.status(400).json({error: validation});
  }

  const result = await supabase
    .from('containers')
    .insert([{ name: name.trim(), description, location, image_url }])
    .select()
    .single();

  const data = result.data;
  const error = result.error;

  if (error) {
    return res.status(500).json({error: error.message});
  }

  res.status(201).json(data);
});

app.put('/api/containers/:id', async (req, res) => {
  const id = req.params.id;
  const {name, description, location, image_url} = req.body;
 
  const validation = validateEntry(req.body, 'Container');
  if (validation) {
    return res.status(400).json({error: validation});
  }
 
  const {data, error} = await supabase
    .from('containers')
    .update({name: name.trim(), description, location, image_url})
    .eq('id', id)
    .select()
    .single();
 
  if (error) return res.status(500).json({error: error.message});
  if (!data) return res.status(404).json({error: 'Container not found'});
  res.json(data);
});

app.delete('/api/containers/:id', async (req, res) => {
  const id = req.params.id;
 
  const {count, error: countError} = await supabase
    .from('items')
    .select('id', {count: 'exact', head: true})
    .eq('container_id', id);
  if (countError) return res.status(500).json({error: countError.message});
  if (count > 0) {
    return res.status(409).json({error: 'Move or delete the items inside this container before deleting it.'});
  }

  const result = await supabase.from('containers').delete().eq('id', id).select('id');
 
  if (result.error) return res.status(500).json({error: result.error.message});
  if (!result.data.length) return res.status(404).json({error: 'Container not found'});
  res.status(204).send();
});

app.get('/api/items', async (req, res) => {
  let query = supabase.from('items').select('*, containers(name)');
 
  if (req.query.favorited === 'true') {
    query = query.eq('is_favorited', true);
  }
 
  const { data, error } = await query.order('created_at', { ascending: true });
 
  if (error) return res.status(500).json({ error: error.message });
 
  const shaped = data.map(({ containers, ...item }) => ({
    ...item,
    container_name: containers ? containers.name : null,
  }));
 
  res.json(shaped);
});

app.get('/api/items/:id', async (req,res) => {
  const id = req.params.id;

  const result = await supabase
    .from('items')
    .select('*, containers(id, name)')
    .eq('id',id)
    .single();

  const data = result.data;
  const error = result.error;

  if (error) return res.status(404).json({error: 'Item not found'});

  const item = data;

  res.json({
    ...item,
    container_name: item.containers ? item.containers.name : null
  });
});

app.post('/api/items', async (req,res) => {
  const name = req.body.name;
  const description = req.body.description;
  const image_url = req.body.image_url;
  const container_id = req.body.container_id;
  const is_favorited = req.body.is_favorited;

  const validation = validateEntry(req.body, 'Item');
  if (validation) {
    return res.status(400).json({error: validation});
  }

  const result = await supabase
    .from('items')
    .insert([
      {
        name,
        description,
        image_url,
        container_id: container_id || null,
        is_favorited: !!is_favorited
      }
    ])
    .select()
    .single();

  const data = result.data;
  const error = result.error;

  if (error) return res.status(500).json({error: error.message});

  res.status(201).json(data);
});

app.put('/api/items/:id', async (req, res) => {
  const id = req.params.id;
  const name = req.body.name;
  const description = req.body.description;
  const image_url = req.body.image_url;
  const container_id = req.body.container_id;
  const is_favorited = req.body.is_favorited;

  const validation = validateEntry(req.body, 'Item');
  if (validation) {
    return res.status(400).json({error: validation});
  }

  const result = await supabase
    .from('items')
    .update({
      name,
      description,
      image_url,
      container_id: container_id || null,
      ...(is_favorited !== undefined ? {is_favorited: !!is_favorited} : {})
    })
    .eq('id',id)
    .select()
    .single();

  const data = result.data;
  const error = result.error;

  if (error) return res.status(500).json({error: error.message});
  if (!data) return res.status(404).json({error: 'Item not found'});

  res.json(data);
});

app.patch( '/api/items/:id/favorite', async(req,res) => {
  if (typeof req.body?.is_favorited !== 'boolean') {
    return res.status(400).json({error: 'Favorite must be true or false'});
  }
  const id = req.params.id;
  const is_favorited = req.body.is_favorited;

  const result = await supabase
    .from('items')
    .update({is_favorited:!!is_favorited})
    .eq('id',id)
    .select()
    .single();

  const data = result.data;
  const error = result.error;

  if (error) return res.status(500).json({error: error.message});
  if (!data) return res.status(404).json({error: 'Item not found'});

  res.json(data);
});

app.delete( '/api/items/:id', async (req, res) => {
  const id = req.params.id;

  const result = await supabase
    .from('items')
    .delete()
    .eq('id',id)
    .select('id');

  const error = result.error;

  if (error) return res.status(500).json({error: error.message});

  if (!result.data.length) return res.status(404).json({error: 'Item not found'});
  res.status(204).send();
});

app.use('/api', (req, res) => res.status(404).json({error: 'Not found'}));



app.get("/", (req, res) => {
  console.log("HELLO")
  res.send("Hello from Express!");
}); 

app.use((req, res) => {
  res.status(404).json({error: "404: Not found"});
});

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error instanceof multer.MulterError || error.type === 'entity.parse.failed' ? 400 : error.status || 500;
    res.status(status).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'Your image must be 5 MB or smaller' : error.message || 'Something went wrong' });
  });
  return app;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) throw new Error('Set SUPABASE_URL and SUPABASE_KEY in the root .env file.');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const port = Number(process.env.PORT) || 5000;
  createApp(supabase).listen(port, () => console.log(`WheresMyStuff API listening on port ${port}`));
}
