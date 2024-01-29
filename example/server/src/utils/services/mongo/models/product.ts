import mongoose from 'mongoose';
const ProductSchema = new mongoose.Schema({
  name: { type: String, default: '' },// 端口名称
  cover: { type: String, default: '' },// 商品图片
  price: { type: Number, default: 1 },// 商品价格
}, { timestamps: true });// 自动使用时间戳
//定义了名为id的虚拟属性
ProductSchema.virtual('id').get(function () {
  // mongoose在保存文档的时候，会自动添加一个字段_id
  return this._id.toHexString();// _id是一个ObjectId对象，用toHexString可以转成16位的字段串
});
//把Product实体转成JSON话记得转换虚拟属性
ProductSchema.set('toJSON', {
  virtuals: true
});
ProductSchema.set('toObject', {
  virtuals: true
});
//定义一个Product的模型
const Product = mongoose.model('Product', ProductSchema);
Product.countDocuments().then(count => {
  if (count === 0) {
    Product.create({
      name: '小米手机',
      cover: 'https://img.yzcdn.cn/vant/ipad.jpeg',
      price: 1
    });
    Product.create({
      name: '华为手机',
      cover: 'https://img.yzcdn.cn/vant/ipad.jpeg',
      price: 2
    });
    Product.create({
      name: '苹果手机',
      cover: 'https://img.yzcdn.cn/vant/ipad.jpeg',
      price: 3
    });
  }
});

export { Product };