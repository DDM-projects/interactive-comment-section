const logBtn = document.querySelector(".log-and-register__login");
const registerBtn = document.querySelector(".log-and-register__register");
const logOutBtn = document.querySelector(".log-and-register__logOut");

const username = document.querySelector(".current-username__value");

const log = document.querySelector(".log");
const logForm = document.querySelector(".log__form");

const register = document.querySelector(".register");
const registerForm = document.querySelector(".register__form");

const logInput = document.querySelectorAll(".log input");
const registerInput = document.querySelectorAll(".register input");

const logRemember = document.querySelector(".log__remember");

const registerPasswordInput = document.querySelector(".register__password");
const registerLoginInput = document.querySelector(".register__login");

const registerUsernameInput = document.querySelector(".register__username");

const footer = document.querySelector(".footer");

let idOfEditedElement = undefined;

registerInput.forEach((input) =>
    input.addEventListener("input", () => {
        input.style.borderColor = "black";
    })
);

const addUser = async (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const formEntries = formData.entries();
    const registerData = Object.fromEntries(formEntries);

    const newUser = {
        id: new Date().getTime().toString(),
        username: registerData.username,
        createdAt: new Date().toLocaleString(),
        login: registerData.registerLogin,
        password: registerData.registerPassword,
        image: { png: `https://robohash.org/${registerData.username}.png` },
    };

    if (data.users.some((user) => user.login == registerData.registerLogin)) {
        registerLoginInput.style.borderColor = "red";
        alert("Login already exist");
        return;
    }

    if (data.users.some((user) => user.username == registerData.username)) {
        registerUsernameInput.style.borderColor = "red";
        alert("Username already exist");
        return;
    }

    if (!/\d/.test(registerData.registerPassword)) {
        registerPasswordInput.style.borderColor = "red";
        alert("Password must contain at least one number");
        return;
    }

    if (registerData.username.length > 20) {
        registerUsernameInput.style.borderColor = "red";
        alert("Username must contain less than 15 characters");
        return;
    }

    if (registerData.registerPassword.length < 6) {
        alert("Password must contain at least 6 elements");
        return;
    }

    const postUserInFile = await postUser(newUser);

    if (postUserInFile === "error") {
        return;
    }

    if (postUserInFile === "success") {
        data.users.push(newUser);
    }

    removeForm();
};
registerForm.addEventListener("submit", addUser);

const findCurrentUser = async (event) => {
    event.preventDefault();
    const formData = new FormData(logForm);
    const formEntries = formData.entries();
    const loginData = Object.fromEntries(formEntries);
    const login = loginData.login;
    const password = loginData.password;
    const rememberUser = loginData.remember ? true : false;

    const findUser = data.users?.find((user) => user.login == login);

    if (findUser && findUser.password == password) {
        const postCurrentUserInFile = await postCurrentUser({
            ...findUser,
            remember: rememberUser,
        });

        if (postCurrentUserInFile === "error") {
            return;
        }

        if (postCurrentUserInFile === "success") {
            data.currentUser = { ...findUser };

            if (rememberUser) {
                data.currentUser = {
                    ...data.currentUser,
                    remember: rememberUser,
                };
            }
        }

        if (!findUser || (findUser && findUser.password != password)) {
            alert("Incorrect login or password");
            return;
        }

        logIn();
        removeForm();
    }
};

const photoCurrentUser = document.querySelector(".footer__photo-user");

const logOut = async () => {
    const deleteCurrentUserInFile = await deleteCurrentUser(data.currentUser.id);

    if (deleteCurrentUserInFile === "error") {
        return;
    }

    if (deleteCurrentUserInFile === "success") {
        data.currentUser = "";
    }

    logBtn.style.display = "block";
    logOutBtn.style.display = "none";
    registerBtn.style.display = "block";

    footer.style.display = "none";
    username.innerHTML = "";
    addCommentsToHtml();
};

const logIn = () => {
    if (data.currentUser) {
        logBtn.style.display = "none";
        logOutBtn.style.display = "block";
        registerBtn.style.display = "none";
        username.innerHTML = data.currentUser.username;
        footer.style.display = "flex";
        photoCurrentUser.src = data.currentUser.image.png;

        const btnSubmit = document.querySelector(".footer__form-button");
        btnSubmit.addEventListener("click", addComment);
        addCommentsToHtml();
    }
};

const checkIfRemembered = async () => {
    if (data.currentUser && !data.currentUser.remember) {
        await logOut();
    }

    if (data.currentUser && data.currentUser.remember) {
        logIn();
    } else {
        logBtn.style.display = "block";
        logOutBtn.style.display = "none";
        registerBtn.style.display = "block";
        addCommentsToHtml();
    }
};

logOutBtn.addEventListener("click", logOut);
logForm.addEventListener("submit", findCurrentUser);

logBtn.addEventListener("click", () => {
    cover.style.display = "block";
    log.style.display = "block";
});

registerBtn.addEventListener("click", () => {
    cover.style.display = "block";
    register.style.display = "block";
});

const removeForm = () => {
    cover.style.display = "none";
    log.style.display = "none";
    register.style.display = "none";
    logInput.forEach((input) => {
        input.checked = false;
        input.value = "";
    });

    registerInput.forEach((input) => {
        input.value = "";
        input.style.borderColor = "black";
    });
};

cover.addEventListener("click", removeForm);

const handleEditBtn = (e) => {
    addCommentsToHtml();
    document.removeEventListener("click", handleRemoveEditForm);

    const id = e.target.dataset.id;

    if (id === idOfEditedElement) {
        idOfEditedElement = undefined;
        addCommentsToHtml();
        return;
    }

    idOfEditedElement = id;

    const editedSection = document.querySelector(`section[data-id='${id}']`);
    const editedContent = editedSection.querySelector(".comment__content");
    const commentParagraph = editedContent.querySelector(".comment__content p");
    const textarea = document.createElement("textarea");
    editedContent.appendChild(textarea);
    textarea.classList.add("comment__textarea");
    textarea.value = commentParagraph.textContent;
    editedContent.removeChild(commentParagraph);
    commentParagraph.textContent = "";

    const buttonDiv = document.createElement("div");
    const updateBtn = document.createElement("button");
    updateBtn.addEventListener("click", () => updateContent(id, textarea));
    editedContent.appendChild(buttonDiv);
    buttonDiv.classList.add("comment__div");
    buttonDiv.appendChild(updateBtn);
    updateBtn.classList.add("footer__form-button", "comment__update-button");
    updateBtn.textContent = "UPDATE";
    updateBtn.style.marginTop = "10px";
    setTimeout(() => document.addEventListener("click", handleRemoveEditForm), 0);

    if (textarea.value.trim() === "") {
        return;
    }
};

const handleRemoveEditForm = (e) => {
    const editedSection = document.querySelector(`section[data-id='${idOfEditedElement}']`);
    const textarea = editedSection?.querySelector(".comment__textarea");
    removeEditForm(e, editedSection, textarea);
};

const updateContent = async (id, textarea) => {
    const editedElement = checkIfCommentOrReply(id);

    if (textarea.value.trim() === "" || textarea.value === editedElement.comment.content) {
        return;
    }

    if (!editedElement.isReply) {
        const patchEditedCommentContent = await patchComment(id, { content: textarea.value, edited: true });

        if (patchEditedCommentContent === "error") {
            return;
        }

        if (patchEditedCommentContent === "success") {
            editedElement.comment.content = textarea.value;
            editedElement.comment.edited = true;
        }
    } else {
        const parentId = editedElement.parentComment.id;
        const replyId = editedElement.replyId;
        const copiedReplies = editedElement.parentComment.replies.filter(Boolean);
        const replyToEdit = copiedReplies.find((reply) => reply.id === replyId);
        replyToEdit.content = textarea.value;
        replyToEdit.edited = true;
        const newComment = { ...editedElement.parentComment, replies: copiedReplies };
        const editReply = await putComment(parentId, newComment);

        if (editReply === "error") {
            return;
        }

        if (editReply === "success") {
            editedElement.parentComment.replies = copiedReplies;
        }
    }

    addCommentsToHtml();

    idOfEditedElement = undefined;
};

const removeEditForm = (e, editedSection, textarea) => {
    e.stopPropagation();
    let isAnyEditIconClicked = false;
    let isAnyButtonClicked = false;
    const editBtn = document.querySelectorAll(".comment__edit");

    editBtn.forEach((edit) => {
        if (edit.isEqualNode(e.target)) {
            isAnyEditIconClicked = true;
        }
    });

    const isClickedEditForm = editedSection?.contains(e.target);
    const isClickedTextarea = textarea?.contains(e.target);

    const allButtons = document.querySelectorAll("button");
    allButtons.forEach((button) => {
        if (button.isEqualNode(e.target)) {
            isAnyButtonClicked = true;
        }
    });

    if (!isClickedEditForm && !isAnyEditIconClicked && !isAnyButtonClicked && !isClickedTextarea) {
        addCommentsToHtml();
        idOfEditedElement = undefined;
        document.removeEventListener("click", handleRemoveEditForm);
    }
};

const checkAdmin = async () => {
    const adminUser = data.users.find((user) => user.id === "0");

    if (!adminUser) {
        const adminUser = {
            id: "0",
            username: "admin",
            createdAt: new Date().toLocaleString(),
            login: "admin",
            password: "admin1234",
            image: { png: "https://robohash.org/admin.png" },
        };

        const getAdminToUserFile = await postUser(adminUser);

        if (getAdminToUserFile === "error") {
            return;
        }

        if (getAdminToUserFile === "success") {
            data.users.push(adminUser);
        }
    }
};
