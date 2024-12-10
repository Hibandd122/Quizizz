const apiUrl = "https://api.quizit.online/quizizz/answers";
let quizUrl = prompt("Please enter the Quiz URL:");

// Validate if the quizUrl is entered
if (!quizUrl) {
    console.log("Quiz URL is required. Please reload the page and enter the URL.");
} else {
    let questionsAnswered = 0;

    // Define the function to fetch answers
    function fetchAnswers() {
        console.clear();

        fetch(apiUrl + `?pin=${encodeURIComponent(quizUrl)}`)
            .then(response => response.json())
            .then(data => {
                if (data.message === "Ok" && data.data) {
                    const answers = data.data.answers || [];
                    answers.forEach(answer => {
                        const questionText = (answer.question.text || "").replace(/<\/?p>/g, "").trim();
                        const answerText = (answer.answers[0].text || "").replace(/<\/?p>/g, "").trim();
                        const questionElements = document.querySelectorAll('p[style="display:inline"]');
                        questionElements.forEach(questionElement => {
                            const pageQuestionText = questionElement.innerText.trim();
                            if (pageQuestionText === questionText) {
                                console.log(`Correct answer: ${answerText}`);
                                const options = document.querySelectorAll('.option');
                                let found = false;
                                options.forEach(option => {
                                    const optionText = option.querySelector('#optionText p').innerText.trim();
                                    if (optionText === answerText) {
                                        const optionTextElement = option.querySelector('#optionText p');
                                        if (optionTextElement) {
                                            optionTextElement.style.fontWeight = "bold";
                                            optionTextElement.style.backgroundColor = "#ffcc00";
                                            optionTextElement.style.color = "#ffffff";
                                        }

                                        if (option && option.click) {
                                            setTimeout(() => {
                                                option.click();
                                                questionsAnswered++;
                                            }, 500);
                                        }

                                        found = true;
                                    }
                                });

                                // If no correct answer is found, highlight incorrect options
                                if (!found) {
                                    const optionTextElements = document.querySelectorAll('.option p');
                                    optionTextElements.forEach(optionTextElement => {
                                        optionTextElement.style.fontWeight = "bold";
                                        optionTextElement.style.backgroundColor = "#ffcc00";
                                        optionTextElement.style.color = "#ffffff";
                                    });
                                    console.log(`No correct answer found. Highlighting incorrect options.`);
                                }
                            }
                        });
                    });
                    setTimeout(fetchAnswers, 2000);
                } else {
                    if (data.message) {
                        console.log("Error message from API:", data.message);
                    } else {
                        console.log("No data from API.");
                    }
                }
            })
            .catch(error => {
                console.error(`Error fetching data: ${error}`);
            });
    }

    // Fetch answers using the provided quiz URL
    fetchAnswers();
}
