const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Tạo thư mục uploads nếu chưa có
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Database giả lập bằng file JSON
const DB_PATH = path.join(__dirname, 'db.json');

const getAlbums = () => {
    if (!fs.existsSync(DB_PATH)) return [];
    const data = fs.readFileSync(DB_PATH);
    return JSON.parse(data);
};

const saveAlbums = (albums) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(albums, null, 2));
};

// Database cho Slideshows
const SLIDESHOW_DB_PATH = path.join(__dirname, 'db_slideshows.json');

const getSlideshows = () => {
    if (!fs.existsSync(SLIDESHOW_DB_PATH)) return {};
    const data = fs.readFileSync(SLIDESHOW_DB_PATH);
    return JSON.parse(data);
};

const saveSlideshows = (slideshows) => {
    fs.writeFileSync(SLIDESHOW_DB_PATH, JSON.stringify(slideshows, null, 2));
};

// Endpoints cho Album
app.get('/api/albums', (req, res) => {
    const albums = getAlbums();
    res.json(albums);
});

app.post('/api/upload', upload.array('photos', 10), (req, res) => {
    const host = req.get('host');
    // Luôn ưu tiên https nếu dùng devtunnels hoặc proxy
    const protocol = host.includes('devtunnels.ms') ? 'https' : req.protocol;
    
    const files = req.files.map(file => ({
        id: Date.now() + Math.random(),
        url: `${protocol}://${host}/uploads/${file.filename}`,
        caption: file.originalname
    }));
    res.json(files);
});

app.post('/api/albums', (req, res) => {
    const albums = getAlbums();
    const newAlbum = {
        id: Date.now(),
        ...req.body
    };
    albums.unshift(newAlbum);
    saveAlbums(albums);
    res.json(newAlbum);
});

app.patch('/api/albums/:id', (req, res) => {
    const albums = getAlbums();
    const index = albums.findIndex(a => a.id == req.params.id);
    if (index !== -1) {
        albums[index].images = [...albums[index].images, ...req.body.images];
        albums[index].count = albums[index].images.length;
        saveAlbums(albums);
        res.json(albums[index]);
    } else {
        res.status(404).json({ error: 'Không tìm thấy album' });
    }
});

// Endpoints cho Slideshow
app.post('/api/slideshows', (req, res) => {
    const slideshows = getSlideshows();
    const id = Math.random().toString(36).substring(2, 9);
    slideshows[id] = {
        id,
        images: req.body.images,
        createdAt: new Date().toISOString()
    };
    saveSlideshows(slideshows);
    res.json({ id });
});

app.get('/api/slideshows/:id', (req, res) => {
    const slideshows = getSlideshows();
    const slideshow = slideshows[req.params.id];
    if (slideshow) {
        res.json(slideshow);
    } else {
        res.status(404).json({ error: 'Không tìm thấy slideshow' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
