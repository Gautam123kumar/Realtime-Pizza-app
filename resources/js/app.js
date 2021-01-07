import axios from 'axios'
import Noty from 'noty'
import {initAdmin} from './admin'
import moment from 'moment'

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')


function updateCart(pizza){
    axios.post('/update-cart',pizza).then(res =>{
    //    console.log(res)
        cartCounter.innerText = res.data.totalQty
        new Noty({
            type: 'success',
            timeout : 1000,
            text:'Item added to cart',
            progressBar:false
        }).show();
    }).catch (err =>{
        new Noty({
            type: 'success',
            timeout : 1000,
            text:'Something Went Wrong',
            progressBar:false
        }).show();
    })
}


addToCart.forEach((btn) =>{
    btn.addEventListener('click',(e) => {
   
        let pizza = JSON.parse(btn.dataset.pizza)
        updateCart(pizza)

    })
})

// Remove alert message after X seconds
const alertMsg = document.querySelector('#success-alert')
if(alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 2000)
}

initAdmin()

//change order status

let statuses = document.querySelectorAll('.status_line');
//console.log(statuses)
let hidderInput = document.querySelector('#hidderInput');
let order = hidderInput ? hidderInput.value:null

order =JSON.parse(order)
console.log(order)
function updateStatus(order){
    let stepCompleted = true;
    statuses.forEach((status)=>{
        let dataProp = status.dataset.status
        if(stepCompleted){
            status.classList.add('step-completed')
            //console.log(status)
        }
        if(dataProp == order.status){
            stepCompleted=false
            if(status.nextElementSibling){
                status.nextElementSibling.classList.add('current')
            }
        }
    })
}


updateStatus(order);

//socket:
let socket = io();
//join
if(order){
    socket.emit('join',`order_${order._id}`)
}

socket.on('orderUpdated',(data)=>{
    const updatedOrder = { ...order }
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    updateStatus(updatedOrder)
    new Noty({
        type:'success',
        timeout : 1000,
        text:'Order updated',
        progressBar:false,
    }).show();
})

