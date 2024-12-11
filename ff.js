const apiUrl = "https://api.quizit.online/quizizz/answers";
let quizUrl = prompt("Please enter the Quiz URL:");
if (!quizUrl) {
    console.log("Quiz URL is required. Please reload the page and enter the URL.");
} else {
    let questionsAnswered = 0;
    function fetchAnswers() {
        console.clear();
        const playAgainButton = document.querySelector('button[data-cy="primary-action-btn"]');
        if (playAgainButton) {
            console.log("Nút 'Play again' đã xuất hiện. Dừng mã.");
            return;
        }
        fetch(apiUrl + `?pin=${encodeURIComponent(quizUrl)}`)
            .then(response => response.json())
            .then(data => {
                if (data.message === "Ok" && data.data) {
                    const answers = data.data.answers || [];
                    answers.forEach(answer => {
                        const questionText = (answer.question.text || "").replace(/<\/?[^>]+(>|$)/g, "").trim();
                        const answerText = (answer.answers[0].text || "").replace(/<\/?[^>]+(>|$)/g, "").trim();
                        const imageUrl = (answer.question.image || "").split('?')[0];
                        const questionElements = document.querySelectorAll('p[style="display:inline"]');
                        const imageElements = document.querySelectorAll('img[data-testid="question-container-image"]');
                        const divQuestionElements = document.querySelectorAll('[data-v-94904112]');
                        let questionMatched = false;
                        questionElements.forEach(questionElement => {
                            const pageQuestionText = questionElement.innerText.trim();
                            if (pageQuestionText === questionText || pageQuestionText.includes(questionText)) {
                                questionMatched = true;
                                console.log(`Correct answer: ${answerText}`);
                                highlightAndClickOption(answerText);
                            }
                        });
                        if (!questionMatched) {
                            imageElements.forEach(imageElement => {
                                const pageImageUrl = (imageElement.src || "").split('?')[0];
                                if (pageImageUrl === imageUrl) {
                                    console.log(`Correct answer (by image): ${answerText}`);
                                    highlightAndClickOption(answerText);
                                }
                            });
                        }
                        if (!questionMatched) {
                            divQuestionElements.forEach(divElement => {
                                const strongText = divElement.querySelector('p strong')?.innerText.trim();
                                const emText = divElement.querySelector('p em')?.innerText.trim();

                                if (strongText && emText && questionText.includes(emText)) {
                                    questionMatched = true;
                                    console.log(`Correct answer (by div): ${answerText}`);
                                    highlightAndClickOption(answerText);
                                }
                            });
                        }
                    });
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
        setTimeout(fetchAnswers, 5000);
    }
    function highlightAndClickOption(answerText) {
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
    fetchAnswers();
}
