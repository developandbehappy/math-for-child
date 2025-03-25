// Основные переменные
let currentDifficulty = 1;
let totalSolved = 0;
let correctSolved = 0;
let incorrectSolved = 0;
let timerInterval;
let timeRemaining = 30 * 60; // 30 минут в секундах
let timerRunning = false;
let tasks = [];

// DOM элементы
const difficultySlider = document.getElementById('difficulty-slider');
const difficultyValue = document.getElementById('difficulty-value');
const additionCheckbox = document.getElementById('addition');
const subtractionCheckbox = document.getElementById('subtraction');
const multiplicationCheckbox = document.getElementById('multiplication');
const divisionCheckbox = document.getElementById('division');
const refreshTasksButton = document.getElementById('refresh-tasks');
const startTimerButton = document.getElementById('start-timer');
const pauseTimerButton = document.getElementById('pause-timer');
const resetTimerButton = document.getElementById('reset-timer');
const timerDisplay = document.getElementById('timer');
const timerBar = document.getElementById('timer-bar');
const tasksList = document.getElementById('tasks-list');
const totalSolvedElement = document.getElementById('total-solved');
const correctSolvedElement = document.getElementById('correct-solved');
const incorrectSolvedElement = document.getElementById('incorrect-solved');

// Инициализация
document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
    // Настройка слайдера сложности
    difficultySlider.addEventListener('input', updateDifficulty);
    updateDifficulty();
    
    // События для кнопок и чекбоксов
    refreshTasksButton.addEventListener('click', generateTasks);
    startTimerButton.addEventListener('click', startTimer);
    pauseTimerButton.addEventListener('click', pauseTimer);
    resetTimerButton.addEventListener('click', resetTimer);
    
    // Генерация начальных задач
    generateTasks();
    
    // Обновление статистики
    updateStatistics();
}

// Обновление уровня сложности
function updateDifficulty() {
    currentDifficulty = parseInt(difficultySlider.value);
    difficultyValue.textContent = currentDifficulty;
}

// Генерация диапазона чисел в зависимости от сложности
function getNumberRange() {
    switch (currentDifficulty) {
        case 1: return { min: 0, max: 10 };
        case 2: return { min: 0, max: 20 };
        case 3: return { min: 0, max: 50 };
        case 4: return { min: 0, max: 75 };
        case 5: return { min: 0, max: 100 };
        default: return { min: 0, max: 10 };
    }
}

// Генерация случайного числа в заданном диапазоне
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Создание математического примера
function createTask() {
    const range = getNumberRange();
    const operations = [];
    
    if (additionCheckbox.checked) operations.push('+');
    if (subtractionCheckbox.checked) operations.push('-');
    if (multiplicationCheckbox.checked) operations.push('*');
    if (divisionCheckbox.checked) operations.push('/');
    
    // Если ничего не выбрано, добавляем сложение по умолчанию
    if (operations.length === 0) {
        operations.push('+');
        additionCheckbox.checked = true;
    }
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;
    
    switch (operation) {
        case '+':
            num1 = getRandomNumber(range.min, range.max);
            num2 = getRandomNumber(range.min, range.max);
            answer = num1 + num2;
            break;
        case '-':
            num1 = getRandomNumber(range.min, range.max);
            num2 = getRandomNumber(range.min, Math.min(num1, range.max));
            answer = num1 - num2;
            break;
        case '*':
            num1 = getRandomNumber(range.min, Math.floor(Math.sqrt(range.max)));
            num2 = getRandomNumber(range.min, Math.floor(range.max / Math.max(1, num1)));
            answer = num1 * num2;
            break;
        case '/':
            // Подбираем числа так, чтобы деление было без остатка
            num2 = getRandomNumber(1, Math.floor(Math.sqrt(range.max)));
            const possibleMultipliers = Math.floor(range.max / num2);
            const multiplier = getRandomNumber(1, possibleMultipliers);
            num1 = num2 * multiplier;
            answer = num1 / num2;
            break;
    }
    
    const displayOperation = operation === '*' ? '×' : operation === '/' ? '÷' : operation;
    
    return {
        num1,
        num2,
        operation: displayOperation,
        answer,
        userAnswer: null,
        isCorrect: null
    };
}

// Генерация всех задач
function generateTasks() {
    tasks = [];
    for (let i = 0; i < 20; i++) {
        tasks.push(createTask());
    }
    renderTasks();
}

// Отображение задач на странице
function renderTasks() {
    tasksList.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        if (task.isCorrect === true) {
            taskElement.classList.add('correct');
        } else if (task.isCorrect === false) {
            taskElement.classList.add('incorrect');
        }
        
        const taskText = document.createElement('span');
        taskText.textContent = `${task.num1} ${task.operation} ${task.num2} = `;
        
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.placeholder = '?';
        if (task.userAnswer !== null) {
            inputElement.value = task.userAnswer;
        }
        inputElement.addEventListener('focusout', (e) => {
            const value = parseInt(e.target.value);
            if (!isNaN(value)) {
                checkAnswer(index, value);
            }
        });
        
        taskElement.appendChild(taskText);
        taskElement.appendChild(inputElement);
        tasksList.appendChild(taskElement);
    });
}

// Проверка ответа
function checkAnswer(index, value) {
    const task = tasks[index];
    task.userAnswer = value;
    
    // Конвертируем символы операций обратно
    let realOperation = task.operation;
    if (task.operation === '×') realOperation = '*';
    if (task.operation === '÷') realOperation = '/';
    
    // Проверяем ответ
    const isCorrect = value === task.answer;
    
    // Если ответ изменился
    if (task.isCorrect !== isCorrect) {
        // Обновляем статистику
        if (task.isCorrect === true) {
            correctSolved--;
        } else if (task.isCorrect === false) {
            incorrectSolved--;
        }
        
        if (task.isCorrect === null) {
            totalSolved++;
        }
        
        if (isCorrect) {
            correctSolved++;
        } else {
            incorrectSolved++;
        }
        
        task.isCorrect = isCorrect;
        updateStatistics();
    }
    
    // Обновляем отображение задачи
    renderTasks();
    
    // Проверяем, все ли задачи решены
    if (areAllTasksSolved()) {
        generateTasks();
    }
}

// Проверка, все ли задачи решены
function areAllTasksSolved() {
    return tasks.every(task => task.userAnswer !== null);
}

// Обновление статистики
function updateStatistics() {
    totalSolvedElement.textContent = totalSolved;
    correctSolvedElement.textContent = correctSolved;
    incorrectSolvedElement.textContent = incorrectSolved;
}

// Функции управления таймером
function startTimer() {
    if (!timerRunning) {
        timerRunning = true;
        timerInterval = setInterval(updateTimer, 1000);
        startTimerButton.disabled = true;
        pauseTimerButton.disabled = false;
    }
}

function pauseTimer() {
    if (timerRunning) {
        timerRunning = false;
        clearInterval(timerInterval);
        startTimerButton.disabled = false;
        pauseTimerButton.disabled = true;
    }
}

function resetTimer() {
    pauseTimer();
    timeRemaining = 30 * 60;
    updateTimerDisplay();
    timerBar.style.width = '100%';
    startTimerButton.disabled = false;
}

function updateTimer() {
    if (timeRemaining > 0) {
        timeRemaining--;
        updateTimerDisplay();
        // Обновляем прогресс-бар
        const progressPercent = (timeRemaining / (30 * 60)) * 100;
        timerBar.style.width = `${progressPercent}%`;
    } else {
        // Время истекло
        clearInterval(timerInterval);
        timerRunning = false;
        alert('Время истекло! Тренировка завершена.');
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
