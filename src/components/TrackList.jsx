import React from 'react'


export default function TrackList({tracks,currentIndex,onSelect}){
return (
<div className="track-list card">
{tracks.map((t,idx)=> (
<div key={t.id}
className={`track-item ${idx===currentIndex? 'active':''}`}
onClick={()=>onSelect(idx)}>
<img src={t.cover} alt="cover" className="cover" />
<div>
<div style={{fontWeight:600}}>{t.title}</div>
<div style={{color:'var(--muted)'}}>{t.artist}</div>
</div>
</div>
))}
</div>
)
}