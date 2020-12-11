
const socket=io()


//Elements
const $messageForm=document.querySelector('#message-form');
const $messageFormInput=$messageForm.querySelector('input');
const $messageFormButton=$messageForm.querySelector('button');
const $sendLocationButton=document.querySelector('#send-location');
const $message=document.querySelector('#messages');
 
//templates
const messgaeTemplate=document.querySelector('#message-template').innerHTML;
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML;

//options
function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

var username = getParameterByName('username'); // "lorem"
var room = getParameterByName('room');

//Autoscrolling for message viewing
const autoscroll=()=>{
    //New message element
    const $newMessage = $message.lastElementChild

    //height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $message.offsetHeight
    const containerHeight = $message.scrollHeight
    const scrollOffset = $message.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $message.scrollTop = $message.scrollHeight
    } 


}

socket.on('message',(message) => {
    console.log(message)
    const html=Mustache.render(messgaeTemplate,{
        username:message.username,
       message : message.text,
       createdAt: moment(message.createdAt).format('h:mm a')
    });
    $message.insertAdjacentHTML('beforeend',html);
    autoscroll();
})
socket.on('locationMessage',(message)=>{
    console.log(message);
    const html=Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend',html);
    autoscroll();
})
socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit',(e) =>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled');
    const message = document.querySelector('input').value
   
    socket.emit('sendMessage', message,(error)=>{
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value=' ';
        $messageFormInput.focus();
        if(error)
        {
            return console.log(error);
        }
        console.log("This message was delievered",message);
    });
    
})

$sendLocationButton.addEventListener('click',(e)=>{
    if(!navigator.geolocation){
        return('Geolocation is not supported by your browser');

    }
    $sendLocationButton.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position);
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude

        },()=>{
            console.log("Location Shared");
            $sendLocationButton.removeAttribute('disabled');
        });
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error)
    {
        alert(error)
        location.href= '/'
    }
})

