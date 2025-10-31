import express from 'express';
import Order from '../models/Order.js';
const router = express.Router();
router.post('/', async (req, res) => { try { const o = new Order(req.body); await o.save(); res.json({ success: true, id: o._id }); } catch (err) { res.status(500).json({ success:false, error: err.message }); } });
router.get('/', async (req, res) => { const items = await Order.find().sort({ date: -1}); res.json(items); });
export default router;
