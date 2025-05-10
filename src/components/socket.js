 

let stompClient = null;

 
export function connect(onMessageCallback) {
  const socket = new window.SockJS('http://localhost:9090/ws');
  stompClient = window.Stomp.over(socket);

  stompClient.connect({}, (frame) => {
    console.log('Connected:', frame);
    stompClient.subscribe('/topic/asignaciones', (msg) => {
        
      if (msg.body && typeof onMessageCallback === 'function') {
        onMessageCallback(msg.body);
      }
    });
    const userData = JSON.parse(localStorage.getItem('userData'));
    stompClient.subscribe(
        `/topic/user/${userData.id}/notifications`,
        (message) => {
      
          const  notification= JSON.parse(message.body);
          console.log("recibiendo notificacion ",notification);
          onMessageCallback(notification);
        
        }
      );
  }, (error) => {
    console.error('Connection error:', error);
  });
}

 
export function sendMessage(message) {
 
  if (stompClient && stompClient.connected) {
    stompClient.send('/app/sendMessage', {}, message);
  } else {
    console.error('WebSocket not connected.');
  }
}

 
export function disconnect() {
  if (stompClient && stompClient.connected) {
    stompClient.disconnect(() => {
      console.log('Disconnected');
    });
  }
}
