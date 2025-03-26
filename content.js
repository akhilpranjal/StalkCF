async function getSolvedProblems(handle)
{
    let response = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`);
    let data = await response.json();

    if (data.status !== "OK")
    {
        console.error("Error fetching data: ", data.comment);
        return {};
    }

    let categories = {};
    let processedProblems = new Set();

    function processSubmission(submission)
    {
        if (submission.verdict === "OK")
        {
            let rating = submission.problem.rating || "Unrated";
            let probID = submission.problem.contestId + submission.problem.index;

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

    data.result.forEach(processSubmission);
    return categories;

}


function injectSolvedProblems(categories) {
    let profileBox = document.querySelector("._UserActivityFrame_frame");
    if (!profileBox) return;

    let container = document.createElement("div");
    container.id = "solved-problems";
    container.style.padding = "10px";
    container.style.border = "1px solid #ccc";
    container.style.marginTop = "20px";
    container.style.background = "#f9f9f9";

    for (let rating in categories) {
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

        ratingHeader.onmouseover = function() {
            ratingHeader.style.background = "#D6D6D6";
        };
        ratingHeader.onmouseout = function() {
            ratingHeader.style.background = "#E1E1E1";
        };

        let list = document.createElement("ul");
        list.style.display = "none";
        list.style.padding = "10px";
        list.style.marginTop = "5px";
        list.style.background = "#F5F5F5";
        list.style.border = "1px solid #D6D6D6";
        list.style.listStyleType = "none";

        categories[rating].forEach(problem => {
            let item = document.createElement("li");
            item.style.padding = "5px";
            item.style.borderBottom = "1px solid #E0E0E0";
            item.style.overflow = "hidden";

            item.onmouseover = function() {
                item.style.background = "#E8E8E8";
            };
            item.onmouseout = function() {
                item.style.background = "transparent";
            };

            let problemLink = document.createElement("a");
            problemLink.href = `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`;
            problemLink.innerText = problem.name;
            problemLink.target = "_blank";
            problemLink.style.float = "left";
            problemLink.style.color = "#0073e6";

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

        ratingHeader.addEventListener("click", () => {
            list.style.display = (list.style.display === "none") ? "block" : "none";
        });

        container.append(ratingHeader);
        container.append(list);
    }

    profileBox.append(container);
}



function getUserHandleFromURL()
{
    let PartsOfPath = window.location.pathname.split("/");
    return PartsOfPath[PartsOfPath.length - 1];
}



async function main()
{
    let userHandle = getUserHandleFromURL();
    let solvedProblems = await getSolvedProblems(userHandle);
    injectSolvedProblems(solvedProblems);
}


main();