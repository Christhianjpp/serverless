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

const inicializaFormulario = () => {
    const orderForm = document.getElementById('order')
    orderForm.onsubmit = (e) => {
        e.preventDefault()
        const submit = document.getElementById('submit')
        submit.setAttribute('disabled', true)
        const mealsId = document.getElementById('meals-id')
        const mealsIdValue = mealsId.value
        if (!mealsIdValue) {
            alert('debe seleccionar un plato')
            submit.removeAttribute('disabled')

            return
        }
        const token = localStorage.getItem('token')
        const order = {
            meal_id: mealsIdValue,
            user_id: user.email,
        }
        fetch('https://serverless-christhianjpp.vercel.app/api/orders/', {
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


            })

    }
}
const inicalizaDatos = () => {
    fetch('https://serverless-christhianjpp.vercel.app/api/meals/')
        .then(response => response.json())
        .then(data => {
            mealsState = data
            const mealsList = document.getElementById('meals-list')
            const submit = document.getElementById('submit')
            const listItem = data.map(renderItem)
            mealsList.removeChild(mealsList.firstElementChild)
            listItem.forEach(element => mealsList.appendChild(element))
            submit.removeAttribute('disabled')
            fetch('https://serverless-christhianjpp.vercel.app/api/orders/')
                .then(response => response.json())
                .then(orderData => {
                    const orderList = document.getElementById('orders-list')
                    const listOrder = orderData.map(orderData => renderOrder(orderData, data))
                    orderList.removeChild(orderList.firstElementChild)
                    listOrder.forEach(element => orderList.appendChild(element))

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
                console.log(user)
                renderOrders()
            })
    }
}
window.onload = () => {
    renderApp()



}
