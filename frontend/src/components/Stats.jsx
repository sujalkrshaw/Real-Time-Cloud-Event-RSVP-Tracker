export default function Stats({c}){if(!c)return null;return <div className="stats">
<div><b>{c.going}</b><span>Going</span></div><div><b>{c.maybe}</b><span>Maybe</span></div>
<div><b>{c.not_going}</b><span>Not Going</span></div><div><b>{c.available}</b><span>Seats Left</span></div></div>}
