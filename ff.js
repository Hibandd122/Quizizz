const apiUrl = "https://api.quizit.online/quizizz/answers";
let quizUrl = prompt("Please enter the Quiz URL:");

// Validate if the quizUrl is entered
if (!quizUrl) {
    console.log("Quiz URL is required. Please reload the page and enter the URL.");
} else {
    let questionsAnswered = 0;
    let currentQuestion = ""; // Lưu câu hỏi hiện tại để so sánh

    // Define the function to fetch answers
    function fetchAnswers() {
        console.clear();

        // Kiểm tra sự hiện diện của nút "Play again"
        const playAgainButton = document.querySelector('button[data-cy="primary-action-btn"]');
        if (playAgainButton) {
            console.log("Nút 'Play again' đã xuất hiện. Dừng mã.");
            return; // Dừng mã khi thấy nút này
        }

        fetch(apiUrl + `?pin=${encodeURIComponent(quizUrl)}`)
            .then(response => response.json())
            .then(data => {
                if (data.message === "Ok" && data.data) {
                    const answers = data.data.answers || [];
                    answers.forEach(answer => {
                        const questionText = (answer.question.text || "").replace(/<\/?p>/g, "").trim();
                        const answerText = (answer.answers[0].text || "").replace(/<\/?p>/g, "").trim();
                        const imageUrl = (answer.question.image || "").split('?')[0];

                        const questionElements = document.querySelectorAll('p[style="display:inline"]');
                        const imageElements = document.querySelectorAll('img[data-testid="question-container-image"]');

                        let questionMatched = false;

                        // Check by question text
                        questionElements.forEach(questionElement => {
                            const pageQuestionText = questionElement.innerText.trim();
                            if (pageQuestionText === questionText && pageQuestionText !== currentQuestion) {
                                questionMatched = true;
                                currentQuestion = pageQuestionText; // Cập nhật câu hỏi hiện tại
                                console.log(`Correct answer: ${answerText}`);

                                // Đợi 5 giây trước khi click vào đáp án
                                setTimeout(() => {
                                    highlightAndClickOption(answerText);
                                }, 5000);
                            }
                        });

                        // Check by image URL if question text does not match
                        if (!questionMatched) {
                            imageElements.forEach(imageElement => {
                                const pageImageUrl = (imageElement.src || "").split('?')[0];
                                if (pageImageUrl === imageUrl && currentQuestion !== questionText) {
                                    questionMatched = true;
                                    currentQuestion = questionText; // Cập nhật câu hỏi hiện tại
                                    console.log(`Correct answer (by image): ${answerText}`);

                                    // Đợi 5 giây trước khi click vào đáp án
                                    setTimeout(() => {
                                        highlightAndClickOption(answerText);
                                    }, 5000);
                                }
                            });
                        }
                    });
                    setTimeout(fetchAnswers, 5000); // Gọi lại fetchAnswers sau 5 giây
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

    // Function to highlight and click the correct option
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

    // Fetch answers using the provided quiz URL
    fetchAnswers();
}
