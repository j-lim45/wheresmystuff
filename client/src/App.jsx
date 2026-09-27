import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import './index.css';
// import ContainerPage from './pages/ContainerPage';
// import ItemPage from './pages/ItemPage';
// import CreateEditItemPage from './pages/CreateEditItemPage';
// import CreateEditContainerPage from './pages/CreateEditContainerPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* <Route path="/containers/new" element={<CreateEditContainerPage />} />
      <Route path="/containers/:id" element={<ContainerPage />} />
      <Route path="/containers/:id/edit" element={<CreateEditContainerPage />} />

      <Route path="/items/new" element={<CreateEditItemPage />} />
      <Route path="/items/:id" element={<ItemPage />} />
      <Route path="/items/:id/edit" element={<CreateEditItemPage />} /> */}
    </Routes>
  );
}

export default App