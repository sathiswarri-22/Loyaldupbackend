const express = require('express');
const Product = require('../Model/Inventory');
const shortid = require('shortid');
const router = express.Router();


router.post('/add-product', async (req, res) => {
    try {
         const { Itemcode , Model , price , Brand , Inward , Outward , Current } = req.body;
         if (!Itemcode || !Model || !price || !Brand || !Inward || !Outward || !Current) {
             return res.status(400).json({
                 message: 'Inventory field is required'
             });
         }
 
         const randomNum = Math.floor(100 + Math.random() * 900);

         const ProductId = `PROD-${randomNum}`;

         const newProduct = new Product({
            productId : ProductId,
            Itemcode,
            Model,
            price,
            Brand,
            Inward,
            Outward,
            Current
         });
 
         const savedProduct = await newProduct.save();
         return res.status(200).json({
             message: 'Product added successfully',
             product: savedProduct
         });
     } catch (error) {
         console.error(error);
         return res.status(500).json({ message: 'Server error' });
     }
 });
 
 
 router.get('/get-product',async (req,res) => {
     try {
         const stocks = await Product.find();
         res.status(200).json(stocks)
     } catch (error) {
         res.status(500).json({
             error : error.message
         });
     }
 });
 
 
 router.put('/update/:id',async (req,res) => {
     try {
         const updatedstock = await Product.findByIdAndUpdate(req.params.id , req.body)
         res.status(200).json(updatedstock)
     } catch (error) {
         res.status(500).json({
             error : error.message
         });
     }
 });
 
 
 router.delete('/delete/:id', async (req,res) => {
     try {
         const deleteproduct = await Product.findByIdAndDelete(req.params.id)
         res.status(200).json(deleteproduct)
     } catch (error) {
       res.status(500).json({
         error : error.message
       }) ; 
     }
 });
 

 
module.exports = router;