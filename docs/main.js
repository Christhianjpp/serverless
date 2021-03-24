

let mealsState = []
let user = {}
let ruta = 'login' // login, register, orders

const stringToHTML = (s) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(s, 'text/html')
    return doc.body.firstChild
}
const renderItem = (item) => {
    const element = stringToHTML(`<li id="${item._id}">${item.name}</li>`)
    element.addEventListener('click', () => {
        const mealsList = document.getElementById('meals-list')
        Array.from(mealsList.children).forEach(x => x.classList.remove('selected'))
        element.classList.add('selected')
        const mealsIdInput = document.getElementById('meals-id')
        mealsIdInput.value = item._id
    })
    return element
}

const renderOrder = (order, meals) => {
    meal = meals.find(x => x._id === order.meal_id)
    const element = stringToHTML(`<li id="${order._id}"> ${meal.name} - ${order.user_id}</li>`)
    return element

}

const inicializaFormulario = () => {  // cargo el id del plato, el usuario yenvio
    const orderForm = document.getElementById('order')  // traigo el form
    cerrarSesion()
    orderForm.onsubmit = (e) => {           // activo el boton
        e.preventDefault()              //dentengo el refrescar pagina
        const submit = document.getElementById('submit')        // traigo el boton
        submit.setAttribute('disabled', true)              // hablitio el boton
        const mealsId = document.getElementById('meals-id')  // traigo el input
        const mealsIdValue = mealsId.value   // saco el balor de id que esta en el input
        if (!mealsIdValue) {
            alert('debe seleccionar un plato')
            submit.removeAttribute('disabled')
            return
        }
        const token = localStorage.getItem('token')  // traigo el toke
        const order = {
            meal_id: mealsIdValue,
            user_id: user.email,
        }
        fetch('https://serverless-christhianjpp.vercel.app/api/orders/', {  // se envia un post con los datos de la orders
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization: token,
            },
            body: JSON.stringify(order)
        })
            .then(response => response.json())
            .then(response => {
                const renderedOrder = renderOrder(response, mealsState)
                const orderList = document.getElementById('orders-list')
                orderList.appendChild(renderedOrder)
                submit.removeAttribute('disabled')
                eliminarOrders()

            })

    }
}

const eliminarOrders = () => {  // eliminndo las ordenes
    const element = document.querySelectorAll('#orders-list li')  // traigo  todos los li
    element.forEach((element, i) => {  // meto los li en un forEach para seleccionar uno individual
        element.addEventListener('click', () => { // agrego el esuchador para seleccionar
            const elementos = document.getElementById('orders-list')   // traigo la lista de ordenes
            Array.from(elementos.children).forEach(x => x.classList.remove('selected')) //convierto la lista en un arreglo para remover el slected con el forEach
            element.classList.add('selected')           // agrego el selected
            const submitForm = document.getElementById('orders-eliminar')
            const submit = document.getElementById('submitE')
            submit.removeAttribute('disabled')
            const id = element.id
            const token = localStorage.getItem('token')

            submitForm.onsubmit = (e) => {
                e.preventDefault()
                fetch('https://serverless-christhianjpp.vercel.app/api/orders/' + id, {
                    method: 'delete',
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: token,
                    }
                })
                    .then(response => {
                        if (response.status === 204) {
                            element.parentNode.removeChild(element)
                            return
                        }

                    })

            }
        })
    })
    return element

}

const inicalizaDatos = () => {    // trae los datos del servidor 
    fetch('https://serverless-christhianjpp.vercel.app/api/meals/') // trae los platos
        .then(response => response.json())
        .then(data => {
            mealsState = data
            const mealsList = document.getElementById('meals-list') // ul
            const submit = document.getElementById('submit')        // boton enviar
            const listItem = data.map(renderItem)               // envia los datos a tomar formato
            mealsList.removeChild(mealsList.firstElementChild)      // elimina cargando
            listItem.forEach(element => mealsList.appendChild(element)) // pasa los datos a ul
            submit.removeAttribute('disabled')                            // hablita boton
            fetch('https://serverless-christhianjpp.vercel.app/api/orders/')  // trae las ordenes
                .then(response => response.json())
                .then(orderData => {
                    const orderList = document.getElementById('orders-list')  // ul
                    const listOrder = orderData.map(orderData => renderOrder(orderData, data)) // envia las ordenes y platos a tomar formato
                    orderList.removeChild(orderList.firstElementChild) // elimina cargando
                    listOrder.forEach(element => orderList.appendChild(element)) // pasa los datos a ul
                    eliminarOrders()
                    console.log(orderData)

                })

        })
}

const renderApp = () => {
    const token = localStorage.getItem('token')
    if (token) {
        user = JSON.parse(localStorage.getItem('user'))
        return renderOrders()
    }
    renderLogin()
}
const renderOrders = () => {
    const ordersView = document.getElementById('orders-view')
    document.getElementById('app').innerHTML = ordersView.innerHTML
    inicializaFormulario()
    inicalizaDatos()

}

const renderLogin = () => {
    const loginTemplate = document.getElementById('login-template')
    document.getElementById('app').innerHTML = loginTemplate.innerHTML

    const register = document.getElementById('register-form')
    register.onsubmit = (e) => {
        e.preventDefault()
        renderRegistro()

    }
    const loginForm = document.getElementById('login-form')
    loginForm.onsubmit = (e) => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        fetch('https://serverless-christhianjpp.vercel.app/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        }).then(x => x.json())
            .then(respuesta => {
                localStorage.setItem('token', respuesta.token)
                ruta = 'orders'
                return respuesta.token
            })
            .then(token => {
                return fetch('https://serverless-christhianjpp.vercel.app/api/auth/me', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: token,
                    },
                })
            })
            .then(x => x.json())
            .then(fetchedUser => {
                localStorage.setItem('user', JSON.stringify(fetchedUser))
                user = fetchedUser
                renderOrders()
            })
    }
}
const renderRegistro = () => {
    const registerTemplate = document.getElementById('register-template')
    document.getElementById('app').innerHTML = registerTemplate.innerHTML

    const registerForm = document.getElementById('register-form')
    registerForm.onsubmit = (e) => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password1').value
        const password2 = document.getElementById('password2').value
        const nombre = document.getElementById('nombre').value
        const apellido = document.getElementById('apellido').value
        const direccion = document.getElementById('direccion').value
        const telefono = document.getElementById('telefono').value
        if (password !== password2) {
            return alert('La contraseña no coinicide')
        }
        fetch('https://serverless-christhianjpp.vercel.app/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, nombre, apellido, direccion, telefono })
        }).then(response => {
            if (response.status !== 200) {
                alert('El correo electronico ya existe')

            }
            renderLogin()
        })
    }

}

const cerrarSesion = () => {
    const cerrarSesion = document.getElementById('header')
    cerrarSesion.onsubmit = () => {
        const token = ''
        localStorage.setItem('token', token)
    }
}
window.onload = () => {
    renderApp()



}
