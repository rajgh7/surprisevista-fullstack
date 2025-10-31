import React,{useState,useEffect} from 'react'
export default function Cart(){ const [cart,setCart]=useState([])
useEffect(()=> setCart(JSON.parse(localStorage.getItem('cart')||'[]')),[])
const removeAt=(i)=>{ const c=[...cart]; c.splice(i,1); setCart(c); localStorage.setItem('cart',JSON.stringify(c)) }
const total=cart.reduce((s,p)=>s+p.price,0)
return (<section className='max-w-4xl mx-auto px-6 py-8'><h2 className='text-2xl text-sv-purple font-heading mb-4'>Cart</h2>{cart.length===0? <p>No items in cart.</p> : (<div>{cart.map((p,i)=>(<div key={i} className='flex items-center gap-4 bg-white p-3 rounded mb-3'><img src={p.image} className='w-20 h-20 object-cover rounded' alt=''/><div className='flex-grow'><div className='font-semibold'>{p.name}</div><div className='text-sv-orange'>₹{p.price}</div></div><button onClick={()=>removeAt(i)} className='px-3 py-2 border rounded'>Remove</button></div>))}<div className='text-right font-semibold mt-4'>Total: ₹{total}</div><a href='/confirm' className='btn btn-primary inline-block mt-4'>Proceed to Checkout</a></div>)}</section>) }
