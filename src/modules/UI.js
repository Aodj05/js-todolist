import { format } from "date-fns"
import Storage from "./Storage"



export default class UI {
    // Load

    static loadHomepage() {
        UI.loadProjects()
        UI.initProjectBtns()
        UI.openProject('Inbox', document.getElementById('btn-inbox-projects'))
        document.addEventListener('keydown', UI.handleKeyboardInput)
    }

    static loadProjects() {
        Storage.getTodoList().getProjects().forEach((project) => {
            if(project.name !== 'Inbox' &&
               project.name !== 'Today' &&
               project.name !== 'This Week') {
                UI.createProject(project.name)
               }
        })

        UI.initAddProjectBtns()
    }

    static loadTasks(projectName) {
        Storage.getTodoList().getProject(projectName).getTasks().forEach((task) => UI.createTask(task.name, task.dueDate))
        if (projectName !== 'Today' && projectName !== 'This Week') {
            UI.initAddTaskBtns()
        }
    }

    static loadProjectContent(projectName) {
        const projectPreview = document. getElementById('project-preview')
        projectPreview.innerHTML = `<h1 id="project-name">${projectName}</h1>
                                    <div class="tasks-list" id="tasks-list"></div>`
        
        if (projectName !== 'Today' && projectName !== 'This Week') {
            projectPreview.innerHTML += `<button class="btn-add-task" id="btn-add-task">
                                          Add Task
                                        </button>
                                        <div class="add-task-popup" id="add-task-popup">
                                          <input class="input-add-task-popup"
                                                 id="input-add-task-popup"
                                                 type="text"
                                          />
                                          <div class="add-task-popup-btns">
                                            <button class="btn-add-task-popup" id="btn-add-task-popup">
                                              Add
                                            </button>
                                            <button class="btn-cancel-task-popup" id="btn-cancel-task-popup">
                                              Cancel
                                            </button>
                                          </div>
                                        </div>`
        }

        UI.loadTasks(projectName)
    }

    // Create

    static createProject(name) {
        const userProjects = document.getElementById('projects-list')
        userProjects.innerHTML += `<button class="btn-project" data-project-btn
                                      <div class="left-project-panel">
                                        <span>${name}</span>
                                      </div>
                                      <div class="right-project-panel">
                                        <i class="project"></i>
                                      </div>
                                    </button>`

        UI.initProjectBtns()
    }

    static createTask(name, dueDate) {
        const tasksList = document.getElementById('tasks-list')
        tasksList.innerHTML+= `<button class="btn-task" data-task-btn>
                                  <div class="left-task-panel">
                                    <i class="t-item"></i>
                                    <p class="task-content">${name}</p>
                                    <input type="text" class="input-task-name" data-input-task-name>
                                  </div>
                                  <div class="right-task-panel">
                                    <p class="due-date" id="due-date">${dueDate}</p>
                                    <input type="date" class="input-due-date" data-input-due-date>
                                    <i class="project"></i>
                                  </div>
                                </button>`

        UI.initTaskBtns()
    }

    static clear() {
        UI.clearProjectPreview()
        UI.clearProjects()
        UI.clearTasks()
    }

    static clearProjectPreview() {
        const projectPreview = document.getElementById('project-preview')
        projectPreview.textContent = ''
    }

    static clearProjects() {
        const projectsList = document.getElementById('projects-list')
        projectsList.textContent = ''
    }

    static clearTasks() {
        const tasksList = document.getElementById('tasks-list')
        tasksList.textContent = ''
    }

    static closeAllPopups() {
        UI.closeAddProjectPopup()
        if ( document.getElementById('btn-add-task')) {
            UI.closeAddTaskPopup()
        }
        if ( document.getElementById('tasks-list') &&
             document.getElementById('tasks-list').innerHTML !== '') {
                UI.closeAllInputs()
             }
    }

    static closeAllInputs() {
        const taskBtns = document.querySelectorAll('[data-task-btn]')

        taskBtns.forEach((button) => {
            UI.closeRenameInput(button)
            UI.closeSetDateInput(button)
        })
    }

    static handleKeyboardInput(e) {
        if (e.key === 'Escape') UI.closeAllPopups()
    }

    // Adding Projects

    static initAddProjectBtns() {
        const addProjectBtn = document.getElementById('btn-add-projects')
        const addProjectPopupBtn = document.getElementById('btn-add-project-popup')
        const cancelProjectPopupBtn = document.getElementById('btn-cancel-project-popup')
        const addProjectPopupInput = document.getElementById('input-add-project-popup')

        addProjectBtn.addEventListener('click', UI.openAddProjectPopup)
        addProjectPopupBtn.addEventListener('click', UI.addProject)
        cancelProjectPopupBtn.addEventListener('click', UI.closeAddProjectPopup)
        addProjectPopupInput.addEventListener('keypress', UI.handleAddProjectPopupInput)
    }

    static openAddProjectPopup() {
        const addProjectPopup = document.getElementById('add-project-popup')
        const addProjectBtn = document.getElementById('btn-add-project')

        UI.closeAllPopups()
        addProjectPopup.classList.add('active')
        addProjectBtn.classList.add('active')
    }

    static closeAddProjectPopup() {
        const addProjectPopup = document.getElementById('add-project-popup')
        const addProjectBtn = document.getElementById('btn-add-project')
        const addProjectPopupInput = document.getElementById('input-add-project-popup')

        addProjectPopup.classList.add('active')
        addProjectBtn.classList.add('active')
        addProjectPopupInput.classList.value = ''
    }

    static addProject() {
        const addProjectPopupInput = document.getElementById('input-add-project-popup')
        const projectName = addProjectPopupInput.value

        if (projectName === '') {
            alert("Project must have a name")
            return
        }
        
        if (Storage.getTodoList().contains(projectName)) {
            addProjectPopupInput.value = ''
            alert("Project must have a different name than one that already exists")
            return
        }

        Storage.addProject(new Project(projectName))
        UI.createProject(projectName)
        UI.closeAddProjectPopup()
    }

    static handleAddProjectPopupInput(e) {
        if (e.key === 'Enter') UI.addProject()
    }

    // Project Event Listeners

    static initProjectBtns() {
        const inboxProjectsBtn = document.getElementById('btn-inbox-projects')
        const todayProjectsBtn = document.getElementById('btn-today-projects')
        const weekProjectsBtn = document.getElementById('btn-week-projects')
        const projectBtns = document.querySelectorAll('[data-project-button]')
        
        inboxProjectsBtn.addEventListener('click', UI.openInboxTasks)
        todayProjectsBtn.addEventListener('click', UI.openTodayTasks)
        weekProjectsBtn.addEventListener('click', UI.openWeekTasks)
        projectBtns.forEach((projectBtn) => 
          projectBtn.addEventListener('click', UI.handleProjectBtn)
        )
    }

    static openInboxTasks() {
        UI.openProject('Inbox', this)
    }

    static openTodayTasks() {
        Storage.updateTodayProject()
        UI.openProject('Today', this)
    }

    static openWeekTasks() {
        Storage.updateWeekProject()
        UI.openProject('This Week', this)
    }

    static handleProjectBtn(e) {
        const projectName = this.children[0].children[1].textContent

        if (e.target.classList.contains('project')) {
            UI.deleteProject(projectName, this)
            return
        }

        UI.openProject(projectName, this)
    }

    static openProject(projectName, projectBtn) {
        const defaultProjectBtns = document.querySelectorAll('.btn-default-project')
        const projectBtns = document.querySelectorAll('.btn-project')
        const btns = [...defaultProjectBtns, ...projectBtns]

        btns.forEach((btn) => btn.classList.remove('active'))
        projectBtn.classList.add('active')
        UI.closeAddProjectPopup()
        UI.loadProjectContent(projectName)
    }

    static deleteProject(projectName, btn) {
        if (btn.classList.contains('active')) UI.clearProjectPreview()
        Storage.deleteProject(projectName)
        UI.clearProjects()
        UI.loadProjects()
    }

    // Adding Task

    static initAddTaskBtns() {
        const addTaskBtn = document.getElementById('btn-add-task')
        const addTaskPopupBtn = document.getElementById('btn-add-task-popup')
        const cancelTaskPopupBtn = document.getElementById('btn-cancel-task-popup')
        const addTaskPopupInput = document.getElementById('input-add-task-popup')

        addTaskBtn.addEventListener('click', UI.openTaskPopup)
        addTaskPopupBtn.addEventListener('click', UI.addTask)
        cancelTaskPopupBtn.addEventListener('click', UI.closeTaskPopup)
        addTaskPopupInput.addEventListener('keypress', UI.handleAddTaskPopupInput)
    }

    static openAddTaskPopup() {
        const addTaskPopup = document.getElementById('add-task-popup')
        const addTaskBtn = document.getElementById('btn-add-task')

        UI.closeAllPopups()
        addTaskPopup.classList.add('active')
        addTaskBtn.classList.add('active')
    }

    static closeAddTaskPopup() {
        const addTaskPopup = document.getElementById('add-task-popup')
        const addTaskBtn = document.getElementById('btn-add-task')
        const addTaskInput = document.getElementById('input-add-task-popup')

        addTaskPopup.classList.remove('active')
        addTaskBtn.classList.remove('active')
        addTaskInput.value = ''
    }

    static addTask() {
        const projectName = document.getElementById('project-name').textContent
        const addTaskPopupInput = document.getElementById('input-add-task-popup')
        const taskName = addTaskPopupInput.value

        if (taskName === '') {
            alert('Task must have a name')
            return
        }
        if (Storage.getTodoList().getProject(projectName).contains(taskName)) {
            alert('Task must have a different name than one that already exists')
            addTaskPopupInput.value = ''
            return
        }

        Storage.addTask(projectName, new Task(taskName))
        UI.createTask(taskName, 'No date')
        UI.closeAddTaskPopup()
    }

    static handleAddTaskPopupInput(e) {
        if (e.key === 'Enter') UI.addTask()
    }

    // Task Event Listeners

    static initTaskBtns() {
        const taskBtns = document.querySelectorAll('[data-task-btn]')
        const taskNameInputs = document.querySelectorAll('[data-input-task-name]')
        const dueDateInputs = document.querySelectorAll('[data-input-due-date]')

        taskBtns.forEach((taskBtn) =>
          taskBtn.addEventListener('click', UI.handleTaskBtn)
        )
        taskNameInputs.forEach((taskNameInput) =>
          taskNameInput.addEventListener('keypress', UI.renameTask)
        )
        dueDateInputs.forEach((dueDateInput) =>
          dueDateInput.addEventListener('change', UI.setTaskDate)
        )
    }

    static handleTaskBtn(e) {
        if (e.target.classList.contains('t-item')) {
            UI.setTaskCompleted(this)
            return
        }
        if(e.target.classList.contains('project')) {
            UI.deleteTask(this)
            return
        }
        if (e.target.classList.contains('task-content')) {
            UI.openRenameInput(this)
            return
        }
        if (e.target.classList.contains('due-date')) {
            UI.openSetDateInput(this)
        }
    }

    static setTaskCompleted(taskBtn) {
        const projectName = document.getElementById('project-name').textContent
        const taskName = taskBtn.children[0].children[1].textContent

        if (projectName === 'Today' || projectName === 'This week') {
            const parentProjectName = taskName.split('(')[1].split('(')[0]
            Storage.deleteTask(parentProjectName, taskName.split(' ')[0])
            if (projectName === 'Today') {
                Storage.updateTodayProject()
            } else {
                Storage.updateWeekProject()
            }
        } else {
            Storage.deleteTask(projectName, taskName)
        }
        UI.clearTasks()
        UI.loadTasks(projectName)
    }

    static deleteTask(taskBtn) {
        const projectName = document.getElementById('project-name').textContent
        const taskName = taskBtn.children[0].children[1].textContent

        if (projectName === 'Today' || projectName === 'This week') {
            const mainProjectName = taskName.split('(')[1].split('(')[0]
            Storage.deleteTask(mainProjectName, taskName)
        }
        Storage.deleteTask(projectName, taskName)
        UI.clearTasks()
        UI.loadTasks(projectName)
    }

    static openRenameInput(taskBtn) {
        const taskNamePara = taskBtn.children[0].children[1]
        let taskName = taskNamePara.textContent
        const taskNameInput = taskBtn.children[0].children[2]
        const projectName = taskBtn.parentNode.parentNode.children[0].textContent

        if (projectName === 'Today' || projectName === 'This week') {
            ;[taskName] = taskName.split(' (')
        }

        UI.closeAllPopups()
        taskNamePara.classList.add('active')
        taskNameInput.classList.add('active')
        taskNameInput.value = taskName
    }

    static closeRenameInput(taskBtn) {
        const taskName = taskBtn.children[0].children[1]
        const taskNameInput = taskBtn.children[0].children[2]

        taskName.classList.remove('active')
        taskNameInput.classList.remove('active')
        taskNameInput.value = ''
    }

    static renameTask(e) {
        if (e.key !== 'Enter') return

        const projectName = document.getElementById('project-name').textContent
        const taskName = this.previousElementSibling.textContent
        const newTaskName = this.value

        if (newTaskName === '') {
            alert('Task must have a name')
            return
        }

        if (Storage.getTodoList().getProject(projectName).contains(newTaskName)) {
            this.value = ''
            alert('Task must have a different name than one that already exists')
            return
        }

        if (projectName === 'Today' || projectName === 'This Week') {
            const mainProjectName = taskName.split('(')[1].split('(')[0]
            const mainTaskName = taskName.split(' ')[0]
            Storage.renameTask(projectName, taskName, `${newTaskName} (${mainProjectName})`)
            Storage.renameTask(mainProjectName, mainTaskName, newTaskName)
        } else {
            Storage.renameTask(projectName, taskName, newTaskName)
        }
        UI.clearTasks()
        UI.loadTasks(projectName)
        UI.closeRenameInput(this.parentNode.parentNode)
    }

    static openSetDateInput(taskBtn) {
        const dueDate = taskBtn.children[1].children[0]
        const dueDateInput = taskBtn.children[1].children[1]

        UI.closeAllPopups()
        dueDate.classList.add('active')
        dueDateInput.classList.add('active')
    }

    static closeSetDateInput(taskBtn) {
        const dueDate = taskBtn.children[1].children[0]
        const dueDateInput = taskBtn.children[1].children[1]

        dueDate.classList.remove('active')
        dueDateInput.classList.remove('active')
    }

    static setTaskDate() {
        const taskBtn = this.parentNode.parentNode
        const projectName = document.getElementById('project-name').textContent
        const taskName = taskBtn.children[0].children[1].textContent
        const newDueDate = format(new Date(this.value), 'MM/dd/yyyy')

        if (projectName === 'Today' || projectName === 'This week') {
            const mainProjectName = taskName.split('(')[1].split('(')[0]
            const mainTaskName = taskName.split(' (')[0]
            Storage.setTaskDate(projectName, taskName, newDueDate)
            Storage.setTaskDate(mainProjectName, mainTaskName, newDueDate)
            if (projectName === 'Today') {
                Storage.updateTodayProject()
            } else {
                Storage.updateWeekProject()
            }
        } else {
            Storage.setTaskDate(projectName, taskName, newDueDate)
        }
        UI.clearTasks()
        UI.loadTasks(projectName)
        UI.closeSetDateInput(taskBtn)
    }
}