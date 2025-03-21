const USERNAME = 'spencerprice@csu.fullerton.edu'
const PASSWORD = 'Project_04'

const pb = new PocketBase('http://127.0.0.1:8090')

//let authData = await pb.admins.authWithPassword(USERNAME, PASSWORD)
let authData = null

let resultList = null
if (checkID()) {
  const loadedId = pb.authStore.model.id
  let inString = 'user = '
  inString = inString.concat('"', loadedId.toString(), '"')
  console.log(inString)
  resultList = await pb.collection('user_data').getList(1, 50, {
    filter: inString,
  });
}

let data = null

if (resultList) {
  data = resultList.items[0].movie1
}

console.log(resultList)


try {
  console.log(pb.authStore.model.id)
} catch {
  console.log("No user loaded")
  document.getElementById('dashLi').hidden = true
  document.getElementById('logoutLi').hidden = true
}

function checkID() {
  try {
    pb.authStore.model.id
  } catch {
    return false
  }
  return true
}

/* Eventlistener and function to create a new user */
if (document.querySelector('#signupForm')) {
  document.querySelector('#signupForm').addEventListener('submit', async function() {
    event.preventDefault()
    let data = {
      'username': document.getElementById('userIn').value,
      'email': document.getElementById('emailIn').value,
      'password': document.getElementById('passwordIn').value,
      'passwordConfirm': document.getElementById('passwordIn').value
    }
    try {
      const record = await pb.collection('users').create(data)
    } catch (error) {
      alert("Username and/or e-mail exist already.")
      return
    }
    alert("Account created.")
    authData = await authenticate(data.username, data.password, false)
    console.log(authData)
    console.log(pb.authStore.model.id)
    await loadDefault(pb.authStore.model.id)
    window.localStorage.savedPage = 'main'
    location.reload()
  })
}

/* Eventlistener for login form */
if (document.querySelector('#loginForm')) {
  document.querySelector('#loginForm').addEventListener('submit', async function () {
    event.preventDefault()
    authData = await authenticate(document.getElementById('userLogin').value, document.getElementById('passwordLogin').value, true)
    console.log(authData)
    console.log(pb.authStore.model.id)
    window.localStorage.savedPage = 'main'
    location.reload()
  })
}

if (document.querySelector('#toLogout')) {
  document.querySelector('#toLogout').addEventListener("click", function () {
    pb.authStore.clear()
    if (!document.getElementById('root')) {
      location.reload()
    }
    window.localStorage.savedPage = 'login'
    return true
  })
}

async function loadDefault(id) {
  const baseData = {
    "catName": "Category Name",
    "catDesc": "Category Description",
    "title": "Movie Title",
    "opinion": "What was your opinion of the movie?"
  }
  const loadData = {
    "movie1": JSON.stringify(baseData),
    "user": id
  }
  const defDat = await pb.collection('user_data').create(loadData)
}

/* Authenticates user for Login */
async function authenticate(ident, pass, login) {
  let authTmp = null
  if (ident && pass) {
    pb.authStore.clear()
    try {
      authTmp = await pb.collection('users').authWithPassword(ident, pass)
    } catch {
      if (login) {
        alert("Failed to log in.")
      }
      return null
    }
    if (login) {
      alert("Successfully logged in.")
    }
  }
  return authTmp
}

/* Ensures root is present before attempting to load react app */
function checkRoot() {
  if (document.getElementById('root')) {
    const root = ReactDOM.createRoot(document.getElementById('root'))

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  }
}

checkRoot()


function App () {
  async function saveData () {
    data.catName= document.getElementById('categoryName').innerText
    data.catDesc= document.getElementById('categoryDesc').innerText
    data.title= document.getElementById('movieTitle').innerText
    data.opinion= document.getElementById('movieOpinion').innerText
    const recordSub = {
      "movie1": JSON.stringify(data)
    }
    console.log(resultList.items[0].id)
    const record = await pb.collection('user_data').update(resultList.items[0].id, recordSub)
  }
  return (
    <div className="container mx-auto">
      <h1 className="py-4 text-4xl font-bold text-gray-700 text-center">
        Welcome back!
      </h1>
      <hr className="max-w-2xl mx-auto mb-4 bg-gray-800" />
      <div object="">
        <article className="flex flex-col">
          <div>
            <div className="my-4 border-4 border-blue-300 rounded p-4 hover:border-blue-700">
              <h3 className="text-2xl font-medium text-gray-900 title-font mb-2" id="categoryName" contentEditable>
                {data.catName}
              </h3>
              <p className="text-sm text-gray-500 pb-1" id="categoryDesc" contentEditable>
                {data.catDesc}
              </p>
              <div array="" key="movies" sortable="">
                <div>
                  <h4 className="font-medium" id="movieTitle" contentEditable>{data.title}</h4>
                  <p className="text-sm text-gray-500 pb-1" id="movieOpinion" contentEditable>
                    {data.opinion}
                  </p>
                </div>
              </div>
              <button
                className="rounded border font-medium border-blue-900 bg-blue-900 px-4 py-2 text-white hover:bg-transparent hover:text-blue-900 hover:border-blue-900"
                onClick={saveData}>
                Save Data
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}

