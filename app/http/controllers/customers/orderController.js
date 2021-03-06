const Order = require('../../../models/order')
const moment = require('moment')
function orderController (){
    return {
        store(req,res){
          //  console.log(req.body)
          const { phone, address } = req.body
          if(!phone || !address) {
              req.flash('error','All fields are required')
              return res.redirect('/cart')
          }

          const order = new Order({
              customerId: req.user._id,
              items:req.session.cart.items,
              phone,
              address
          })
          order.save().then(result => {
            req.flash('Success','Order Placed Successfully')
            delete req.session.cart

            //Emit
            const eventEmitter = req.app.get('eventEmitter')
            eventEmitter.emit('orderPlaced',result)
            
            return res.redirect('/customer/orders')
          }).catch(err =>{
              req.flash('error','Something Went Wrong')
              return res.redirect('/cart')
          })
        },
        async index(req,res) {
            const orders = await Order.find({ customerId: req.user._id }, null ,
                {sort : {'createdAt':-1 }})
            res.render('customers/orders',{ orders:orders , moment :moment })
   //         console.log(orders)
        },
        async show(req,res) {
            const order = await Order.findById(req.params.id)
            // Authorize user
            if(req.user._id.toString() === order.customerId.toString()){
              return  res.render('customers/singleOrder',{ order })
            }
               return res.redirect('/');
        }
    }
}

module.exports = orderController