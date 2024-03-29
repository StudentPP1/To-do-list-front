import './Task.css'
import TaskTick from '../tasktick/TaskTick';
import edit_pencil from '../../images/edit.png';
import TaskModalBar from '../UI/modal/TaskModalBar'
import { useState, useEffect, useCallback } from 'react';
import TaskEditTitle from '../taskeditfields/TaskEditTitle';
import TaskEditDescription from '../taskeditfields/TaskEditDescription';
import TaskDatePicker from '../datepicker/TaskDatePicker';
import TagList from '../taglist/TagList';
import down_arrow from '../../images/down-arrow.png'
import AddTask from '../addtask/AddTask';
import TaskService from '../../API/TaskService';
import UserService from '../../API/UserService';


const Task = ({boards, setBoards, done_tasks, setDoneTasks, task, all_tags, tasks, setTasks}, ...props) => {
    const [isOpen, setOpen] = useState(false);
    const [isTagsOpen, setTagsOpen] = useState(false);
    const [modalBar, setModalBar] = useState(false);
    const [addTaskModal, setAddTaskModal] = useState(false);
    const [titleValue, setTitleValue] = useState(task.title);
    const [currentDate, setDate] = useState(task.date);
    const [tags, setTags] = useState(task.tagsId);
    const [subtasks, setSubTasks] = useState(task.subTasksId);
    const [isSubTaskOpen, setSubTaskOpen] = useState(false);
    const [subTaskLevel, setSubTaskLevel] = useState(0);
    const [currentTask, setCurrentTask] = useState(task)
    const [parentTask, setParentTask] = useState(null)
    const [isSubTask, setIsSubTask] = useState(false)
    
    const max_sub_task_level = 5;
   
    if (task.description == '') {
        var desc_default = "Description"
    }
    else {
        var desc_default = task.description;
    }
    
    const [descValue, setDescValue] = useState(desc_default);
    
    const get_current_board = () => {
        boards.map((board) => {
            if (board.items.indexOf(task) != -1) {
                return board
            }
        })
    }
    const changeTask = (name, description, date, tags, sub_tasks) => {
     
        if (parentTask.id != task.id) {
         
            parentTask.sub_tasks = parentTask.sub_tasks.map((subtask) => {
                if (subtask == currentTask) {
                    subtask.name = name;
                    subtask.description = description;
                    subtask.date = date;
                    subtask.tags = tags;
                    subtask.sub_tasks = sub_tasks;
                    return subtask
                }
                else {
                    return subtask
                }
            })
        
        } 

        else {
            currentTask.name = name;
            currentTask.description = description;
            currentTask.date = date;
            currentTask.tags = tags;
            currentTask.sub_tasks = sub_tasks;    
        }

    }

    const changeContents = (task, isOpen, title, desc, date, tags, subtasks, level) => {
        setParentTask(currentTask)
        setCurrentTask(task)
        setSubTaskOpen(isOpen)
        setTitleValue(title)
        setDescValue(desc)
        setDate(date)
        setTags(tags)
        setSubTasks(subtasks)
        setSubTaskLevel(level + 1)
    }

    const [currentSubTask, setSubCurrentTask] = useState(null)

    function dragStartHandlerInTask(e, task) {
        setSubCurrentTask(task)
      }
    
      function dragEndHandlerInTask(e) {
        e.target.style.boxShadow = 'none' 
      }
    
      function dragOverHandlerInTask(e) {
        e.preventDefault() 
        e.target.style.boxShadow = '0 2px 0 #FFFFFF' 
      }
    
      function dropHandlerInTask(e, task) {
        e.preventDefault()
     
        setSubTasks(subtasks.map(t => {
          if (t.id === task.id) { 
            return {...t, order: currentSubTask.order}
          }
          if (t.id === currentSubTask.id) {
            return {...t, order: task.order}
          }
          return t
        }))
        e.target.style.boxShadow = 'none' 
      }
    
      const sortTasks = (a, b) => {
        if (a.order > b.order) {
          return 1
        }
        else {
          return -1
        }
      }
    

    return (
        <div {...props} className="task">
            <TaskModalBar visible={modalBar} setVisible={setModalBar}>
             
                <div className='task-modal'>
                    <div className="close">
                        <div className='close-void'>
                        </div>
                        <div className="close-area" onClick={(e) => { 
                             setModalBar(false)
                             setSubTaskOpen(false)
                             setTagsOpen(false)
                             changeTask(titleValue, descValue, currentDate, tags, subtasks)
                             e.target.parentNode.parentNode.parentNode.parentNode.draggable=true
                            }}>
                            <button className="close-button">
                                x
                            </button>
                        </div>
                    </div>

                    <div className='modal-content'>
                        <div className='task__side-content left'>
                            <div className='sub-task-view'>
                                {/* {subtasks.length > 0 
                                ? 
                                <div className='sub-task-open-button' onClick={() => {setSubTaskOpen(!isSubTaskOpen)}}>
                                    <img className={`sub-task-open-button-img ${isSubTaskOpen ? 'open' : ''}`} src={down_arrow} alt=''/>
                                </div>
                                : 
                                <div></div>
                                }
                                {subtasks.length > 0 
                                ? 
                                <div className={`sub-task-list ${isSubTaskOpen ? 'open' : ''}`}>
                                {console.log(subtasks)}
                                { 
                                subtasks.sort(sortTasks).map((sub_task) => 
                                    <div>
                                        <div 
                                        onDragStart={(e) => dragStartHandlerInTask(e, sub_task)} 
                                        onDragLeave={(e) => dragEndHandlerInTask(e)} 
                                        onDragEnd={(e) => dragEndHandlerInTask(e)} 
                                        onDragOver={(e) => dragOverHandlerInTask(e)} 
                                        onDrop={(e) => dropHandlerInTask(e, sub_task)} 
                                        draggable={true} 
                                        className='sub_task'
                                        >
                                            <TaskTick 
                                            boards={boards} 
                                            setBoards={setBoards} 
                                            done_tasks={done_tasks} 
                                            setDoneTasks={setDoneTasks} 
                                            current_task={sub_task} 
                                            tasks={subtasks} 
                                            setTasks={setSubTasks}
                                            isSubTask={true}
                                            />
                                            <span onClick={() => {
                                            changeContents(
                                                sub_task,
                                                false, 
                                                sub_task.name, 
                                                sub_task.description, 
                                                sub_task.date,
                                                sub_task.tags,
                                                sub_task.sub_tasks,
                                                subTaskLevel
                                                )
                                            setIsSubTask(true)
                                        }}>{sub_task.name}</span>
                                        </div>
                                        <span className="task__underline"></span>
                                    </div>
                                )}
                                </div>
                                :
                                <div></div>
                                }
                             */}
                                <div className='task-text'>
                                    <div className='task__title'>
                                        <TaskTick 
                                            boards={boards} 
                                            setBoards={setBoards}
                                            done_tasks={done_tasks} 
                                            setDoneTasks={setDoneTasks} 
                                            current_task={currentTask} 
                                            tasks={parentTask} 
                                            setTasks={null}
                                            isSubTask={isSubTask}
                                        />
                                        <TaskEditTitle titleValue={titleValue} setTitleValue={setTitleValue}/>
                                    </div>
                                    <TaskEditDescription descValue={descValue} setDescValue={setDescValue}/>
                                </div>
                            </div>
                            <div className="task__content">
                                <div className="task-buttons">
                                    {subTaskLevel < max_sub_task_level
                                    ? 
                                    <div>
                                        
                                        <button className="add-task" onClick={() => {setAddTaskModal(!addTaskModal); }}>
                                            <span>
                                                Add sub-task
                                            </span>
                                        </button>

                                        <AddTask 
                                        tags={tags} 
                                        visible={addTaskModal} 
                                        setVisible={setAddTaskModal} 
                                        tasks={subtasks} 
                                        currentTask={currentTask}
                                        parentTask={parentTask}
                                        setTasks={setSubTasks}/>
                                    </div>
                                    :
                                    <div></div>
                                    }
                                    
                                    <button className="save-task" onClick={() => {
                                        changeTask(titleValue, descValue, currentDate, tags, subtasks)
                                        }}>
                                        <span>
                                            Save task
                                        </span>
                                    </button>

                                    <button className="delete-task" onClick={() => {setModalBar(false);
                                        if (boards == null) {
                                            setTasks(tasks.filter(t => t !== currentTask))
                                            if (parentTask != null) {
                                                parentTask.sub_tasks = parentTask.sub_tasks.filter(t => t !== currentTask)
                                            }
                                        }
                                        else {
                                            if (currentTask.id == task.id) {
                                                setTasks(tasks.map((task_list) => {
                                                    if (task_list.indexOf(task) != -1) {
                                                        return task_list.filter(t => t !== task)
                                                    }
                                                    else {
                                                        return task_list
                                                    }
                                                }))
                                            
                                            } else {
                                                parentTask.sub_tasks = parentTask.sub_tasks.filter(t => t !== currentTask)
                                        
                                            }
                                            setBoards(boards.map((board) => {
                                                if (board.items.indexOf(currentTask) != -1) {
                                                    board.items = board.items.filter(t => t !== currentTask)
                                                    return board
                                                }
                                                else {
                                                    return board
                                                }
                                            }
                                            ))
                                        }
                                        
                                        }}>
                                        <span>
                                            Delete task
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="task__side-content right">
                            <TaskDatePicker currentDate={currentDate} setDate={setDate}/>
                            
                            <div className="task__tags">
                                {/* <TagList all_tags={all_tags} tags={currentTask.tags} setTags={setTags} isTagsOpen={isTagsOpen} setTagsOpen={setTagsOpen}/>

                                <ul className="label-list">
                                    {currentTask.tags.map((tag) => 
                                    <li>
                                    {
                                        <a style={{backgroundColor: tag.color}}>{tag.name}</a>
                                    }
                                    </li>
                                    )}
                                </ul> */}
                            </div>
                        </div>
                    </div>
                </div>
            </TaskModalBar>

            <div className="main-task__content">

                <div class="task__title">
                    <TaskTick 
                    boards={boards} 
                    setBoards={setBoards}
                    done_tasks={done_tasks}
                    setDoneTasks={setDoneTasks} 
                    current_task={task} 
                    tasks={tasks} 
                    setTasks={setTasks}
                    isSubTask={false}
                    />
                    
                    <span className="title" onClick={() => {
                        setModalBar(true)   
                        changeContents(
                            task,
                            false,
                            task.title,
                            task.description,
                            task.date,
                            task.tags,
                            task.sub_tasks,
                            0
                            )
                    }}>{task.title.length > 50 ? `${task.title.slice(0, 50)}...` : task.title}</span>  
                    {/* <ul className="tags-list">
                        <li>
                            {task.tags.length > 1
                            ? 
                            <a style={{color: task.tags[0].color}}>{task.tags[0].name}</a>
                            :
                            <a></a>}
                            {task.tags.length > 1
                            ? 
                            <span style={{color: task.tags[0].color}}>{task.tags.length-1 > 0 ? `+${task.tags.length-1}` : ''}</span>
                            :
                            <span></span>}
                            
                        </li>
                    </ul> */}
                    <div class="task__edit">
                        <button onClick={() => setOpen(!isOpen)}>
                            <img className="edit-img" src={edit_pencil}/>
                        </button>
                        <div className={`edit-menu ${isOpen ? 'open' : ''}`}>
                            <div>
                                <button onClick={() => {
                                    setOpen(false)
                                    setModalBar(true)
                                    setCurrentTask(task)
                                    changeContents(
                                        task,
                                        false,
                                        task.name,
                                        task.description,
                                        task.date,
                                        task.tags,
                                        task.sub_tasks,
                                        0
                                        )
                                    }}>
                                    edit
                                </button>
                            </div>
                            <div>
                                <button onClick={() => {
                                     var today = new Date().toLocaleString();
                                     const temp = today.split('.')
                                     today = temp[2].split(',')[0] + '-' + temp[1].padStart(2, '0') + '-' + temp[0].padStart(2, '0')
                                     console.log(currentTask.id)
                                     TaskService.deleteTask(currentTask.id).then(() => {
                                         console.log("deleted")
                                         UserService.refreshToken(String(localStorage.getItem('access_token'))).then((tokens) => {
                                            console.log("new_tokens", tokens)
                                            localStorage.setItem('access_token', tokens.access_token)
                                            localStorage.setItem('refresh_token', tokens.refresh_token)
                                        }).then(() => {
                                            TaskService.getTasksByDate(today).then((data) => {
                                                setTasks(data)
                                        })
                                 })
                                 })
                                }}>
                                    delete
                                </button>
                            </div>
                        </div>
                    </div>  
                </div> 
            </div>

            <span className="task__underline"></span>
        </div>
    );
};

export default Task;