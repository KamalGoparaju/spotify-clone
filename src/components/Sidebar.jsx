import React from 'react'
import { Link } from 'react-router-dom'


export default function Sidebar(){
return (
<aside className="sidebar">
<h3 style={{margin:0}}>MyMusic</h3>
<nav style={{marginTop:18,display:'flex',flexDirection:'column',gap:8}}>
<Link to="/" style={{color:'inherit',textDecoration:'none'}}>Home</Link>
<Link to="/library" style={{color:'inherit',textDecoration:'none'}}>Library</Link>
</nav>
<div style={{marginTop:24}} className="card">
<strong>Playlists</strong>
<div style={{marginTop:8,color:'var(--muted)'}}>No playlists yet — use the player to save queues.</div>
</div>
</aside>
)
}