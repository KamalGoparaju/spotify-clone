import React from 'react'
import { formatTime } from '../utils/timeFormat'


export default function NowPlaying({current,progress,duration}){
return (
<div className="now-playing card">
<img src={current.cover} alt="cover" style={{width:80,height:80,borderRadius:8}} />
<div style={{marginLeft:12}}>
<div style={{fontWeight:700}}>{current.title}</div>
<div style={{color:'var(--muted)'}}>{current.artist}</div>
<div style={{marginTop:6,color:'var(--muted)'}}>{formatTime(progress)} / {formatTime(duration)}</div>
</div>
</div>
)
}