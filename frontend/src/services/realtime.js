const WS=import.meta.env.VITE_WS_URL||"ws://localhost:8000";
export function subscribe(eventId,token,onMessage){
  let stopped=false,socket,retry=1000;
  const connect=()=>{if(stopped)return;
    socket=new WebSocket(`${WS}/ws/events/${eventId}?token=${encodeURIComponent(token)}`);
    socket.onopen=()=>{retry=1000;socket.send("subscribe")};
    socket.onmessage=e=>onMessage(JSON.parse(e.data));
    socket.onclose=()=>{if(!stopped)setTimeout(connect,retry=Math.min(retry*2,10000))};
  };
  connect(); return()=>{stopped=true;socket?.close()};
}
