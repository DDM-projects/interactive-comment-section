let data;
const main = document.querySelector(".main");
const cover = document.querySelector(".cover");
let idOfCommentWithOpenReplyForm = undefined;

const fetchData = async () => {
    const usersResponse = await getUsers();
    const commentsResponse = await getComments();
    const currentUserResponse = await getCurrentUser();

    if (
        usersResponse.status === "error" ||
        commentsResponse.status === "error" ||
        currentUserResponse.status === "error"
    ) {
        return;
    }

    data = {
        currentUser: currentUserResponse.data[0] || "",
        users: usersResponse.data,
        comments: commentsResponse.data,
    };
};

const createComment = (comment, parentId, addReplyForm) => {
    const id = parentId ? `${parentId}_${comment.id}` : comment.id;
    const checkConditionsForScoresBtn =
        data.currentUser && comment.user.username !== data.currentUser.username ? true : false;
    const checkConditionsForDeleteAndEditBtn = comment.user.username === data.currentUser?.username ? true : false;

    return `<section data-id="${id}" class="comment">
<aside class="comment__scores">
${
    checkConditionsForScoresBtn
        ? `
        <button data-id="${id}" class="comment__plus">
          <img src="images/icon-plus.svg" alt="" class="comment__icon">
        </button>`
        : ""
}
 <div class="comment__score"> 
   <p>${comment.score}</p>
 </div>
 ${
     checkConditionsForScoresBtn
         ? `<button data-id="${id}" class="comment__minus">
         <img src="images/icon-minus.svg" alt="" class="comment__icon">
        </button>`
         : ""
 }
</aside>
<main class="comment__main">
 <header class="comment__header">
   <div class="comment__title">
     <div class="comment__photo">
       <img src="${comment.user.image.png}" alt="" class="comment__photo-user">
     </div>
     <div class="comment__name">
       <p>${comment.user.username}</p>
     </div>
     <div class="comment__date">
       <p>${comment.createdAt}</p>
     </div>
     <div class="comment__edit-info ${comment.edited ? "comment__edit-info--visible" : ""}">
        <p class="comment__edit-info-text">Edited</p>
     </div>
   </div>
   <div class = "comment__buttons">
    ${
        checkConditionsForDeleteAndEditBtn || data.currentUser?.id === "0"
            ? `<button data-id="${id}" class="comment__delete">
     <img src="images/icon-delete.svg" alt="" class="comment__delete-icon">
     <p class="comment__delete-text">Delete</p>
      </button>`
            : ""
    }
    ${
        data.currentUser && id === comment.id
            ? `
            <button data-id="${id}" class="comment__reply">
            <img src="images/icon-reply.svg" alt="" class="comment__reply-icon">
            <p class="comment__reply-text">Reply</p>
             </button>`
            : ""
    }
      ${
          checkConditionsForDeleteAndEditBtn
              ? `<button data-id="${id}" class="comment__edit">
      <img src="images/icon-edit.svg" alt="" class="comment__edit-icon">
      <p class="comment__edit-text">Edit</p>
       </button>`
              : ""
      }
   </div>
 </header>
 <div class="comment__content">
   <p>${comment.content}</p>
 </div>
</main>
</section>
${addReplyForm ? createReplyForm() : ""} 
${
    comment.replies?.length
        ? comment.replies
              .map(
                  (replyComment) =>
                      `<div style="margin-left:20px; width:calc(100% - 20px)">${createComment(
                          replyComment,
                          comment.id
                      )}</div>`
              )

              .join("")
        : ""
}`;
};

const addCommentsToHtml = (id) => {
    let comments = "";

    data.comments.forEach((comment) => {
        if (comment.id == id) {
            const newComment = createComment(comment, undefined, true);
            comments = `${comments}${newComment}`;
        } else {
            const newComment = createComment(comment);
            comments = `${comments}${newComment}`;
        }
    });

    main.innerHTML = comments;
    cover.style.display = "none";

    const btnPlus = document.querySelectorAll(".comment__plus");
    const btnMinus = document.querySelectorAll(".comment__minus");
    const btnDelete = document.querySelectorAll(".comment__delete");

    btnPlus.forEach((element) => element.addEventListener("click", addScore));
    btnMinus.forEach((element) => element.addEventListener("click", substractScore));
    btnDelete.forEach((element) => element.addEventListener("click", handleDeleteButton));

    const btnReply = document.querySelectorAll(".comment__reply");
    btnReply.forEach((element) => element.addEventListener("click", handleReplyButton));

    const editBtn = document.querySelectorAll(".comment__edit");
    editBtn.forEach((btn) => btn.addEventListener("click", handleEditBtn));
};

const textarea = document.querySelector(".footer__textarea");

const addComment = async (e) => {
    e.preventDefault();

    if (textarea.value.trim() === "") {
        return;
    }

    const commentContent = textarea.value;
    const newComment = {
        id: new Date().getTime().toString(),
        content: commentContent,
        createdAt: new Date().toLocaleString(),
        score: 0,
        user: {
            image: {
                png: data.currentUser.image.png,
            },
            username: data.currentUser.username,
        },
        votedBy: [],
        edited: false,
        replies: [],
    };
    const postCommentInFile = await postComment(newComment);

    if (postCommentInFile === "error") {
        return;
    }

    if (postCommentInFile === "success") {
        data.comments.push(newComment);
    }

    addCommentsToHtml();
    textarea.value = "";
};

const handleDeleteButton = (e) => {
    const id = e.target.dataset.id;
    addModalToHtml(id);
};

const checkIfCommentOrReply = (id) => {
    const comment = data.comments.find((comment) => comment.id == id);
    const index = data.comments.indexOf(comment);

    if (id.includes("_")) {
        const [parentId, replyId] = id.split("_");
        const parentComment = data.comments.find((comment) => comment.id == parentId);
        const reply = parentComment.replies.find((reply) => reply.id == replyId);
        return { isReply: true, parentComment: parentComment, reply: reply, replyId: replyId };
    } else {
        if (index < 0) {
            return;
        }
        return { isReply: false, comment: comment };
    }
};

const removeComment = async (id) => {
    const response = checkIfCommentOrReply(id);

    if (response.isReply) {
        const reply = response.reply;
        const parentComment = response.parentComment;
        const parentId = parentComment.id;
        const index = parentComment.replies.indexOf(reply);

        if (index < 0) {
            return;
        }

        const getCommentToDeleteReply = await getCommentById(parentId);

        if (getCommentToDeleteReply.status === "error") {
            return;
        }

        if (getCommentToDeleteReply.status === "success") {
            getCommentToDeleteReply.data.replies.splice(index, 1);
            const commentAfterDeleteReply = getCommentToDeleteReply.data;
            putComment(parentId, commentAfterDeleteReply);
            parentComment.replies.splice(index, 1);
        }
    } else {
        const comment = response.comment;
        const index = data.comments.indexOf(comment);

        if (index < 0) {
            return;
        }

        const deleteCommentInFile = await deleteComment(id);

        if (deleteCommentInFile === "error") {
            return;
        }

        if (deleteCommentInFile === "success") {
            data.comments.splice(index, 1);
        }
    }
    addCommentsToHtml();
};

const createModal = () => {
    return `<section class="modal">
  <h1 class="modal__header">Delete comment</h1>
  <div class="modal__text">Are you sure you want to delete this comment? This will remove the comment and can't be
    undone.</div>
  <div class="modal__buttons">
    <button class="modal__buttons-no">No, cancel</button>
    <button class="modal__buttons-yes">Yes, delete</button>
  </div>
</section>`;
};

const addModalToHtml = (id) => {
    const modal = createModal();
    main.innerHTML += modal;
    cover.style.display = "block";
    const btnNo = document.querySelector(".modal__buttons-no");
    const btnYes = document.querySelector(".modal__buttons-yes");

    btnNo.addEventListener("click", addCommentsToHtml);
    btnYes.addEventListener("click", () => {
        removeComment(id);
    });
    cover.addEventListener("click", addCommentsToHtml);
};

const createReplyForm = () => {
    return `   
  <div class="reply">
  <div class="reply__photo footer__photo">
  <img src="${data.currentUser.image.png}" alt="user-photo" class="reply__photo-user footer__photo-user">
  </div>
  <form name="replyForm" class="reply__form footer__form">
    <textarea class="reply__textarea footer__textarea" placeholder="Add a comment..." maxlength="400"></textarea>
    <button class="reply__form-button footer__form-button">
      Reply
    </button>
  </form>
  </div>`;
};

const handleReplyButton = (e) => {
    document.removeEventListener("click", removeReplyForm);
    const id = e.target.dataset.id;

    if (id === idOfCommentWithOpenReplyForm) {
        idOfCommentWithOpenReplyForm = undefined;
        addCommentsToHtml();
        return;
    }

    idOfCommentWithOpenReplyForm = id;
    addCommentsToHtml(id);
    const btnAddReply = document.querySelector(".reply__form-button");
    btnAddReply.addEventListener("click", (e) => {
        addReply(e, id);
    });
    setTimeout(() => document.addEventListener("click", removeReplyForm), 0);
};

const addReply = async (e, id) => {
    e.preventDefault();

    const replyTextarea = document.querySelector(".reply__textarea");

    if (replyTextarea.value.trim() === "") {
        return;
    }

    const replyContent = replyTextarea.value;
    const comment = data.comments.find((c) => c.id == id);
    const newReply = {
        id: new Date().getTime().toString(),
        content: replyContent,
        createdAt: new Date().toLocaleString(),
        score: 0,
        replyingTo: comment.user.username,
        user: { image: { png: data.currentUser.image.png }, username: data.currentUser.username },
        votedBy: [],
        edited: false,
    };

    const getCommentToAddReply = await getCommentById(id);

    if (getCommentToAddReply.status === "error") {
        return;
    }

    if (getCommentToAddReply.status === "success") {
        getCommentToAddReply.data.replies.push(newReply);
        const commentAfterAddReply = getCommentToAddReply.data;
        putComment(id, commentAfterAddReply);
        comment.replies.push(newReply);
    }

    addCommentsToHtml();
    replyTextarea.value = "";
    document.removeEventListener("click", removeReplyForm);
    idOfCommentWithOpenReplyForm = undefined;
};

const removeReplyForm = (event) => {
    event.stopPropagation();
    const id = event.target.dataset.id;
    let isAnyReplyIconClicked = false;
    const replyForm = document.querySelector(".reply");
    const replyIcon = document.querySelectorAll(".comment__reply");

    replyIcon.forEach((reply) => {
        if (reply.isEqualNode(event.target)) {
            isAnyReplyIconClicked = true;
        }
    });

    const isClickedReplyForm = replyForm?.contains(event.target);
    let isAnyButtonClicked = false;
    const allButtons = document.querySelectorAll("button");

    allButtons.forEach((button) => {
        if (button.isEqualNode(event.target)) {
            isAnyButtonClicked = true;
        }
    });

    if (!isClickedReplyForm && !isAnyReplyIconClicked && !isAnyButtonClicked) {
        addCommentsToHtml();
        idOfCommentWithOpenReplyForm = undefined;
        document.removeEventListener("click", removeReplyForm);
    }
};

const handleChangeScore = async (e, scoreChange) => {
    const id = e.target.dataset.id;
    const chosenCommentOrReply = checkIfCommentOrReply(id);
    const currentUserId = data.currentUser.id;

    if (!chosenCommentOrReply.isReply) {
        if (chosenCommentOrReply.comment.votedBy.includes(currentUserId)) {
            return;
        }
        const updatedScore = chosenCommentOrReply.comment.score + scoreChange;
        const addScoreToComment = await patchComment(id, {
            score: updatedScore,
            votedBy: [...chosenCommentOrReply.comment.votedBy, currentUserId],
        });

        if (addScoreToComment === "error") {
            return;
        }

        if (addScoreToComment === "success") {
            chosenCommentOrReply.comment.score = updatedScore;
            chosenCommentOrReply.comment.votedBy.push(currentUserId);
        }
    } else {
        const parentId = chosenCommentOrReply.parentComment.id;
        const replyId = chosenCommentOrReply.replyId;
        const copiedReplies = chosenCommentOrReply.parentComment.replies.filter(Boolean);
        const replyToScore = copiedReplies.find((reply) => reply.id === replyId);

        if (replyToScore.votedBy.includes(currentUserId)) {
            return;
        }

        replyToScore.score += scoreChange;
        replyToScore.votedBy.push(currentUserId);
        const newComment = { ...chosenCommentOrReply.parentComment, replies: copiedReplies };
        const addScoreToReply = await putComment(parentId, newComment);

        if (addScoreToReply === "error") {
            return;
        }

        if (addScoreToReply === "success") {
            chosenCommentOrReply.parentComment.replies = copiedReplies;
        }
    }
    addCommentsToHtml();
};

const addScore = async (e) => {
    await handleChangeScore(e, +1);
};

const substractScore = async (e) => {
    await handleChangeScore(e, -1);
};
