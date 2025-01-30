// fillForm.js

fillPage()
function fillPage() {
    chrome.storage.sync.get("user_data", function (data) {
        console.log("Data retrieved", data.user_data);
        if (data.user_data) {
            const user_data = data.user_data;
            console.log(document.getElementById("FirstName").value)
            document.getElementById("FirstName").value = user_data.name;
            document.getElementById("Email").value = user_data.email;
            document.getElementById("MemberID").value = user_data.studentNumber;
            document.getElementById("dataCollection").checked = true;
    
            setTimeout(function () {
                document.getElementById("gCaptcha").scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    });
}
