
let cl = console.log;

const postContainer = document.getElementById("postContainer");
const postForm = document.getElementById("postForm");
const titleControl = document.getElementById("title");
const bodyControl = document.getElementById("body");
const userIdControl = document.getElementById("userId");
const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");
const formRow = document.getElementById("formRow");

const baseUrl = `https://jsonplaceholder.typicode.com`;
const postUrl = `${baseUrl}/posts`;

const snackBarMsg = (msg, icon, timer) => {
    swal.fire({
        title: msg,
        icon: icon,
        timer: timer
    })
}

// generic function for API call
const makeApiCall = (methodName, apiUrl, msgBody = null) => {
    let xhr = new XMLHttpRequest();
    xhr.open(methodName, apiUrl);
    xhr.send(JSON.stringify(msgBody));
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300 && xhr.readyState === 4) {
            let res = JSON.parse(xhr.response);
            cl(res);
            if (methodName === "GET") {
                if (Array.isArray(res)) {
                    // if response is array then templating                    
                    // reversing the response to get latest post with id
                    templating(res.reverse());
                }
                else {
                    // patch data in form
                    titleControl.value = res.title;
                    bodyControl.value = res.body;
                    userIdControl.value = res.userId;
                    submitBtn.classList.add("d-none");
                    updateBtn.classList.remove("d-none");
                    document.getElementById("formRow").scrollIntoView();
                }
            } else if (methodName === "POST") {
                // if response is not array but single object
                // if API success then adding id to obj
                msgBody.id = res.id;
                cl(msgBody);
                // creating new card for obj
                let card = document.createElement("div");
                card.id = msgBody.id;
                card.className = `card mt-4`;
                card.innerHTML = `<div class="card-header"><h3 class="mb-0">${msgBody.title}</h3></div>
                                <div class="card-body"><h3 class="mb-0">${msgBody.body}</h3></div>
                                <div class="card-footer">
                                    <button class="btn btn-primary" onclick="onEdit(this)">Edit</button>
                                    <button class="btn btn-danger float-right" onclick="onDelete(this)">Delete</button>
                                </div>`;
                postContainer.prepend(card);
                postForm.reset();
                snackBarMsg(`New Post ${msgBody.title} Added Successfully!!!`, "success", 2000)
            } else if (methodName === "DELETE") {
                // get card by deleteId then remove()
                let id = localStorage.getItem('deleteId');
                document.getElementById(id).remove();
                snackBarMsg("post deleted successfully!!!", "success", 2000);
            }
        }
    }
}
makeApiCall("GET", postUrl);

// templating function
const templating = (arr) => {
    postContainer.innerHTML = arr.map(ele => {
        return `<div class="card mt-4" id="${ele.id}">
                    <div class="card-header"><h3 class="mb-0">${ele.title}</h3></div>
                    <div class="card-body"><h3 class="mb-0">${ele.body}</h3></div>
                    <div class="card-footer">
                        <button class="btn btn-primary" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-danger float-right" onclick="onDelete(this)">Delete</button>
                    </div>
                </div>`
    }).join('');
}


//onEdit() functionality
const onEdit = (ele) => {
    // get closest card and id to edit
    let editId = ele.closest(".card").id;
    cl(editId);
    //set editId in localStorage
    localStorage.setItem("editId", editId);
    //apiUrl for onEdit() >>
    let editUrl = `${baseUrl}/posts/${editId}`;
    //API call for editMode
    makeApiCall("GET", editUrl)
}

// on update btn functionality
const onUpdateBtn = () => {
    // get id to update
    let updateId = localStorage.getItem("editId");
    // get update url
    let updateUrl = `${baseUrl}/posts/${updateId}`;
    // let updated object from formControls
    let updateObj = {
        title: titleControl.value,
        body: bodyControl.value,
        userId: userIdControl.value
    }
    //API call
    makeApiCall("PATCH", updateUrl, updateObj);
    postForm.reset();
    submitBtn.classList.remove("d-none");
    updateBtn.classList.add("d-none");
    let card = [...document.getElementById(updateId).children];
    card[0].innerHTML = `<h3 class="mb-0">${updateObj.title}</h3>`;
    card[1].innerHTML = `<h3 class="mb-0">${updateObj.body}</h3>`;
    document.getElementById(updateId).scrollIntoView();
    snackBarMsg("selected post updated successfully!!!", "success", 2000);
}

//onDelete() functionality
const onDelete = (ele) => {
    // delete id
    let deleteId = ele.closest(".card").id;
    localStorage.setItem("deleteId", deleteId);
    // delete url
    let deleteUrl = `${baseUrl}/posts/${deleteId}`;
    // api call after confirmation
    Swal.fire({
        title: "Are you sure, You want to delete this post?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            makeApiCall("DELETE", deleteUrl);
        }
    });
}

// on postForm submit
const onFormSubmit = (eve) => {
    eve.preventDefault();
    // new post object
    let newPost = {
        title: titleControl.value,
        body: bodyControl.value,
        userId: userIdControl.value
        //id
    }
    // api call create new post from object
    makeApiCall("POST", postUrl, newPost);
}





postForm.addEventListener("submit", onFormSubmit);
updateBtn.addEventListener("click", onUpdateBtn)











