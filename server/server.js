import express from "express";
import multer from 'multer';
import cors from 'cors';
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);


const IMAGE_BUCKET = 'item-images';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

app.post('/api/uploads', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({error: 'No image file provided'});
  }

  const ext = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase();
  const filePath = `items/${Date.now()}-${Math.random()
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
    .select('id, container_id');

  const items = itemResult.data;
  const itemsError = itemResult.error;

  if (itemsError) {
    return res.status(500).json({
      error: itemsError.message
    });
  }

  const counts = {};
  for (const item of items) {
    if (!item.container_id) {
      continue;
    }

    counts[item.container_id] =
      (counts[item.container_id] || 0) + 1;
  }

  
  const withCounts = containers.map((container) => ({
    ...container,
    item_count: counts[container.id] || 0,
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


app.get("/api/items", async (req, res) => {
  console.log("Hello?")
  console.log(process.env.SUPABASE_URL);
  console.log(process.env.SUPABASE_KEY ? 'KEY EXISTS' : 'NO KEY');
  const { data, error } = await supabase
    .from("items")
    .select("*");

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  console.log(data);

  res.json(data);
});

app.post('/api/containers', async (req, res) => {
  const name = req.body.name;
  const description = req.body.description;
  const location = req.body.location;

  if (!name || !name.trim()) {
    return res.status(400).json({error: 'Container name is required'});
  }

  const result = await supabase
    .from('containers')
    .insert([{ name, description, location }])
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
  const {name, description, location} = req.body;
 
  if (!name || !name.trim()) {
    return res.status(400).json({error: 'Container name is required'});
  }
 
  const {data, error} = await supabase
    .from('containers')
    .update({name, description, location})
    .eq('id', id)
    .select()
    .single();
 
  if (error) return res.status(500).json({error: error.message});
  if (!data) return res.status(404).json({error: 'Container not found'});
  res.json(data);
});

app.put('/api/containers/:id', async (req, res) => {
  const id = req.params.id;
  const {name, description, location} = req.body;
 
  if (!name || !name.trim()) {
    return res.status(400).json({error: 'Container name is required'});
  }
 
  const {data, error} = await supabase
    .from('containers')
    .update({name, description, location})
    .eq('id', id)
    .select()
    .single();
 
  if (error) return res.status(500).json({error: error.message});
  if (!data) return res.status(404).json({error: 'Container not found'});
  res.json(data);
});

app.delete('/api/containers/:id', async (req, res) => {
  const id = req.params.id;
 
  const result = await supabase.from('containers').delete().eq('id', id);
 
  if (result.error) return res.status(500).json({error: result.error.message});
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

app.get('/api/items', async (req,res) => {
  let query = supabase.from('items').select('*, containers(name)');

  if (req.query.favorited === 'true') {
    query = query.eq('is_favorited',true);
  }

  const result = await query.order('created_at',{ascending: true});

  const data = result.data;
  const error = result.error;

  if (error) return res.status(500).json({error: error.message});

  const shaped = data.map((item) => ({
    ...item,
    container_name: item.containers ? item.containers.name : null
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

  if (!name || !name.trim()) {
    return res.status(400).json({error: 'Item name is required'});
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

  if (!name || !name.trim()) {
    return res.status(400).json({error: 'Item name is required'});
  }

  const result = await supabase
    .from('items')
    .update({
      name,
      description,
      image_url,
      container_id: container_id || null,
      is_favorited: !!is_favorited
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
    .eq('id',id);

  const error = result.error;

  if (error) return res.status(500).json({error: error.message});

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

app.listen(5000);