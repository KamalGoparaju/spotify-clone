import React from 'react'


export default function SearchBar({query,setQuery}){
return (
<input
className="card"
placeholder="Search songs or artists..."
value={query}
onChange={e=>setQuery(e.target.value)}
style={{width:'100%',padding:10,borderRadius:8,border:'none',outline:'none'}}
/>
)
}