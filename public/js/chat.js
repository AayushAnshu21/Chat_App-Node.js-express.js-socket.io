const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $imageForm = document.querySelector('#image-form')
const $imageFormButton = $imageForm.querySelector('button')


const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


/*var filex = document.getElementById('upfile')
filex.addEventListener('change', (event) => {
    //var newfile = event.target //console.log(URL.createObjectURL(filex.files[0]))  console.log(filex.files) 
    //console.log(event.target)
    var reader = new FileReader();
    reader.onload = () => {
     //document.getElementById('output').src =  reader.result        
    })        
    }
    reader.readAsDataURL(filex.files[0]);   // reader.readAsDataURL(event.target.files[0]);
  });*/
  

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('afterbegin', html)
})

socket.on('imgmessage', (message) => {
    console.log("This is from imgmessage")
    console.log(message.url)    
    
    const html = Mustache.render(messageTemplate, {
      username: message.username,
      url: message.url,
      createdAt: moment(message.createdAt).format("h:mm a"),
    });
    
    $messages.insertAdjacentHTML('afterbegin', html)
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})



$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    


    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()


        if (error) {
            return console.log(error)
        }
    })
})

$imageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $imageFormButton.setAttribute('disabled', 'disabled')

    const img = e.target.elements.imgfile.files[0]
    //console.log("this is from submit form")
    //console.log((img.type.startsWith("image/")))
    //const f = URL.createObjectURL(img)
        
    if (img.type.startsWith('image/') ) {
      var reader = new FileReader();
      reader.onload = () => {
        socket.emit("sendImage", reader.result, (error) => {
          $imageFormButton.removeAttribute("disabled");
          document.getElementById("upfile").value = "";
          if (error) {
            console.log(error);
          }
        });
      };
      reader.readAsDataURL(img);
    }  
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
})



socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})



