// Function to store the data of all the solved problems of a user in an object.
async function getSolvedProblems(handle)
{
    // Fetched user submission data from Codeforces API
    let response = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`);
    // data is a JSON object returned by Codeforces API
    let data = await response.json();
    /* Example of the JSON object->
    {
        "status": "OK",
        "result": [
            {
                "id": 123456789,
                "contestId": 1900,
                "index": "A",
                "problem": {
                    "name": "Example Problem",
                    "contestId": 1900,
                    "index": "A",
                    "rating": 800
                },
                "verdict": "OK"
            },
            ...
        ]
    } */
    

    // Checked if the API request was successful
    if (data.status !== "OK")
    {
        console.error("Error fetching data: ", data.comment);
        return {};
    }


    // Object to store problems categorized by rating
    let categories = {};
    // Used Set to avoid duplicate problems before adding it to the categories
    let processedProblems = new Set();


    // Separate function as the arrow function was becoming too overwhelming to understand.
    function processSubmission(submission)
    {
        // Process only successfully solved problems
        if (submission.verdict === "OK")
        {
            // Handled unrated problems
            let rating = submission.problem.rating || "Unrated";
            // Unique problem ID
            let probID = submission.problem.contestId + submission.problem.index; 

            // Added the problem to the categories only if it hasn't been processed yet
            if (!processedProblems.has(probID))
            {
                processedProblems.add(probID);
                if (!categories[rating])
                {
                    categories[rating] = [];
                }
                categories[rating].push(
                    {
                        name: submission.problem.name,
                        contestId: submission.problem.contestId,
                        index: submission.problem.index,
                        submissionId: submission.id
                    }
                );
            }
        }
    }

    // Process each submission in the retrieved data
    data.result.forEach(processSubmission);

    // Return categorized solved problems
    return categories;
}




// Function to insert all the data on the Codeforces website (particularly in User's Profile Section)
function injectSolvedProblems(categories, categories2) {

    // Locate the user profile section where data will be injected
    let profileBox = document.querySelector("._UserActivityFrame_frame");
    // Exit if the profile section is not found (Not possible, but just in case)
    if (!profileBox) return; 


    // Created a content division to display data
    let container = document.createElement("div");
    container.id = "solved-problems";
    container.style.padding = "10px";
    container.style.border = "1px solid #ccc";
    container.style.marginTop = "20px";
    container.style.background = "#f9f9f9";

    // Iterate through each problem rating category
    for (let rating in categories) 
    {
        // Create a division for each rating
        let ratingHeader = document.createElement("div");
        ratingHeader.style.width = "98%";
        ratingHeader.style.fontFamily = "Verdana, Arial, sans-serif";
        ratingHeader.style.background = "#E1E1E1";
        ratingHeader.style.padding = "10px";
        ratingHeader.style.border = "1px solid #D6D6D6";
        ratingHeader.style.marginTop = "5px";
        ratingHeader.style.cursor = "pointer";
        ratingHeader.style.display = "block";
        ratingHeader.style.overflow = "hidden";

        
        // Added rating text and solved count
        let ratingText = document.createElement("span");
        ratingText.innerText = rating;
        ratingText.style.fontWeight = "bold";
        ratingText.style.float = "left";

        let solvedText = document.createElement("span");
        solvedText.innerText = `(Solved ${categories[rating].length})`;
        solvedText.style.color = "#555";
        solvedText.style.fontSize = "0.9em";
        solvedText.style.float = "right";

        ratingHeader.appendChild(ratingText);
        ratingHeader.appendChild(solvedText);


        // Added hover effects to divisions
        ratingHeader.onmouseover = function() {
            ratingHeader.style.background = "#D6D6D6";
        };
        ratingHeader.onmouseout = function() {
            ratingHeader.style.background = "#E1E1E1";
        };


        // Created a list to store problems under each rating
        let list = document.createElement("ul");
        list.style.display = "none";
        list.style.padding = "10px";
        list.style.marginTop = "5px";
        list.style.background = "#F5F5F5";
        list.style.border = "1px solid #D6D6D6";
        list.style.listStyleType = "none";

        // Populate the list with problems
        categories[rating].forEach(problem => {
            let item = document.createElement("li");
            item.style.padding = "5px";
            item.style.borderBottom = "1px solid #E0E0E0";
            item.style.overflow = "hidden";


            // Highlight problems in Light Green that both users have solved
            if(getYourHandleFromURL()!==getUserHandleFromURL() && getYourHandleFromURL() !== null)
            {
                if (categories2[rating] && categories2[rating].some(p => p.contestId === problem.contestId && p.index === problem.index))
                {
                    item.style.backgroundColor = "#D4EDC9"; // Highlight common problems
                }
            }
            

            // Added hover effects to each problems in the list
            item.onmouseover = function ()
            {
                item.dataset.originalColor = item.style.backgroundColor;
                item.style.background = "#E8E8E8";
            };
            item.onmouseout = function ()
            {
                item.style.background = item.dataset.originalColor;
            };
            

            // Created a link to the problem statement
            let problemLink = document.createElement("a");
            problemLink.href = `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`;
            problemLink.innerText = problem.name;
            problemLink.target = "_blank";
            problemLink.style.float = "left";
            problemLink.style.color = "#0073e6";

            // Created a link to the problem submission
            let submissionLink = document.createElement("a");
            submissionLink.href = `https://codeforces.com/contest/${problem.contestId}/submission/${problem.submissionId}`;
            submissionLink.innerText = "(Submission)";
            submissionLink.target = "_blank";
            submissionLink.style.float = "right";
            submissionLink.style.marginLeft = "5px";
            submissionLink.style.color = "#888";


            item.append(problemLink);
            item.append(submissionLink);
            list.append(item);
        });


        // Toggle visibility of the problem list on division click
        ratingHeader.addEventListener("click", () => {
            list.style.display = (list.style.display === "none") ? "block" : "none";
        });


        container.append(ratingHeader);
        container.append(list);
    }

    // Append the problems list to the profile box
    profileBox.append(container);
}




function getUserHandleFromURL()
{
    // Extract username from the URL path in Search Bar
    let PartsOfPath = window.location.pathname.split("/");
    return PartsOfPath[PartsOfPath.length - 1];
}




function getYourHandleFromURL()
{
    // Extract the logged-in user's handle from the profile link in the header of the webpage
    let MyName = header.querySelector('a[href^="/profile/"]');
    if (MyName)
    {
        return MyName.href.split('/').pop();
    }
    return null;
}





async function main()
{
    // Get handle of the profile being viewed
    let userHandle = getUserHandleFromURL(); 
    // Fetch solved problems
    let solvedProblems = await getSolvedProblems(userHandle); 


    // Get logged-in user handle
    let yourHandle = getYourHandleFromURL(); 
    // Fetch logged-in user’s solved problems
    let yourSolvedProblem = await getSolvedProblems(yourHandle); 
    
    // Inject the data into the profile
    injectSolvedProblems(solvedProblems, yourSolvedProblem);
}




// Run the script
main();
