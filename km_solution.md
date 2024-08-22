## Instructions for Testing via REST API 
- Create .env file in project root, set NODE_ENV to `development`
- With application and DB containers running, make REST calls (i.e. via Postman) to `http://localhost:3000/{endpoint}`
- Seed data with `GET http://localhost:3000/seed` (development environment specific)
- View costs by location via `GET /costs/location`
- View costs by worker via `GET /costs/worker`
- Create tasks at `POST /tasks`, and provide `location_id`, `description` parameters
- Log time on task via `POST /tasks/{task_id}/log-time`, provide `worker_id`, `time_seconds` (int) parameters
- Set status of task via `PUT /tasks/{task_id}/status`, provide 1/0 int value for `task_complete` parameter
- Create worker at `POST /workers`, provide `username (string)`, `hourly_wage (float)` params

- To simply check results after seeding, the following seeded data is provided
    - 1 hour from worker 1 @ $20/hr, 0.5 hours from worker 2 @ $25/hr, task 1, location 2 (Kitchen)
    - 2 hours from worker 2 @ $25/hr, task 2, location 2 (Garage)
    - Locations cost
        -   {
                name: "Kitchen",
                total_cost: "32.50"
            },
            {
                name: "Garage",
                total_cost: "50.00"
            }
    - Workers cost
        -   {
                username: "Michael Jordan",
                total_cost: "20.00"
            },
            {
                username: "Drew Brees",
                total_cost: "62.50"
            }

    - Including filter query params does the following:
        - /costs/workers?task_complete=1
            - Drew Brees cost drops to 12.50, as task 2 is incomplete
        - /costs/workers?task_complete=0
            - Drew Brees cost drops to 50, Michael Jordan will not show, as he has logged no time on incomplete tasks
        - /costs/locations?worker_id=2&location_id=1
            - Location 1 is Kitchen, total_cost is 12.50, as this is cost of Drew Brees working in kitchen @ $25/hr for 0.5 hours

- Create logged_time entries, set the task status, and create other workers/locations/tasks to test additionally
        

## Json Objects for Pie Graphs

- Make 2 group by functions
    - Group by worker and include property in object, `total_cost`
        - Given the `logged_time.worker_id`, find the `hourly_wage` of that worker, calculate cost using all records in `logged_time`
            - 
    - Group by location and include property for total_cost
        - Given grouping of `task.location_id`, create property `total_cost` by gathering all `logged_time` for those tasks and multiplying by `worker.hourly_wage` for matching `logged_time.worker_id`
            - select from logged_time
            - join tasks on task_id
            - join workers on worker_id
            - for each row, cost = time_seconds / into hours, * hourly_wage

## Task Completion Status & Worker/Location filtering

- Sort tasks by completion status
    - Create and Implement `task_status` table schema
        - Create `task_status_schema.sql`
        - In `build-schema.sh`, add line to build new schema
    - Query for pie graph data should be filterable by `task.task_status.completed`
    - Request payload should have optional fields, `worker_id`, `location_id`, `completion_status`, to be included in the queries  


## REST API Docs
- GET: /locations
    - Retrieve all locations
- GET: /workers
    - Retrieve all workers
- GET: /tasks
    - Retrieve all tasks and their status
- GET: /costs/locations
    - ** PARAMS: {worker_id: int, location_id: int, task_complete: int (1/0)} **
    - Retrieve all locations, with optional id and task status fields to filter on
- GET: /costs/workers
    - ** PARAMS: {worker_id: int, location_id: int, task_complete: int (1/0)} **
    - Retrieve all workers, with optional id and task status fields to filter on
