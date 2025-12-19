GET_PROJECTS_WITH_USERID = """
SELECT p.id, p.user_id, p.name, p.cloned_from, p.created_at, p.updated_at, c.name AS default_codespace
FROM projects p
    LEFT JOIN (SELECT name, project_id FROM codespaces 
        WHERE id IN (SELECT MIN(id) FROM codespaces GROUP BY project_id)
    ) c ON p.id = c.project_id
    WHERE p.user_id=%(user_id)s
    AND p.name LIKE %(query_str)s
"""


GET_CODESPACES_WITH_PROJECTID = """
SELECT * FROM codespaces 
WHERE project_id=%(project_id)s
"""

GET_PROJECT_WITH_PROJECTID = """
SELECT * FROM projects WHERE id = %(project_id)s
"""

GET_CODESPACE_WITH_CODESPACEID = """
SELECT * FROM codespaces WHERE id = %(codespace_id)s
"""

GET_PROJECT_FROM_ID = """
SELECT * from projects where id='%s'
"""

CHECK_UNIQUE_PROJECT = """
SELECT COUNT(*) as count from projects where name='%s'
"""

CHECK_UNIQUE_CODESPACE = """
SELECT COUNT(*) as count from codespaces where project_id='%s' AND name='%s'
"""

CREATE_PROJECT_QUERY = """
INSERT INTO projects (user_id, name, cloned_from) VALUES (%(user_id)s, %(name)s, %(cloned_from)s)
"""

CREATE_CODESPACE_QUERY = """
INSERT INTO codespaces (project_id, name, user_id) VALUES (%(project_id)s, %(name)s, %(user)s)
"""

CHECK_UNIQUE_IMPORTED_PROJECT = """
SELECT COUNT(*) as count from projects where cloned_from='%s' and user_id='%s'
"""

DETACH_CLUSTER = """
UPDATE codespaces SET cluster_id = null, jupyter_link = null, sync_job_id = null WHERE id = %(codespace_id)s
"""

ATTACH_CLUSTER = """
UPDATE codespaces SET cluster_id = %(cluster_id)s WHERE id = %(codespace_id)s
"""

GET_LAST_SELECTED_CODESPACE = """
SELECT c.id,
       c.name,
       c.project_id,
       p.name AS project_name,
       p.cloned_from AS cloned_from,
       c.cluster_id,
       c.jupyter_link,
       c.last_synced_at
FROM codespaces c
         LEFT JOIN projects p ON c.project_id = p.id
WHERE c.id = (SELECT codespace_id FROM last_selected_codespace WHERE user_id = %(user_id)s)
"""

GET_CODESPACE_FROM_NAME = """
SELECT * FROM codespaces where project_id=%(project_id)s and name=%(codespace_name)s
"""

UPDATE_CODESPACE_JUPYTER_LINK = """
UPDATE codespaces SET jupyter_link = %(jupyter_link)s WHERE id = %(codespace_id)s
"""

DELETE_PROJECT = """
DELETE FROM projects WHERE id = %(project_id)s
"""

DELETE_CODESPACE = """
DELETE FROM codespaces WHERE id = %(codespace_id)s
"""

ATTACHED_CODESPACES_COUNT = """
SELECT COUNT(*) AS count FROM codespaces where cluster_id = %(cluster_id)s
"""

GET_ALL_PROJECTS = """
SELECT p.id, p.user_id, p.name, p.cloned_from, p.created_at, p.updated_at, c.name AS default_codespace
FROM projects p
    LEFT JOIN (SELECT name, project_id FROM codespaces
        WHERE id IN (SELECT MIN(id) FROM codespaces GROUP BY project_id)
    ) c ON p.id = c.project_id
    WHERE p.name != 'Playground'
    AND p.name LIKE %(query_str)s
"""

GET_PLAYGROUND = """
SELECT p.id, p.user_id, p.name, p.cloned_from, p.created_at, p.updated_at, c.count AS codespace_count 
FROM projects p
LEFT JOIN 
(SELECT count(*) AS count, project_id FROM codespaces GROUP BY project_id) c ON p.id = c.project_id
WHERE p.user_id=%(user_id)s
AND p.name = 'Playground'
"""

UPDATE_PROJECT_TIME = """
UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = %(project_id)s
"""

UPDATE_CODESPACE_NAME = """
UPDATE codespaces SET name=%(codespace_name)s WHERE id = %(codespace_id)s
"""

UPDATE_PROJECT = """
UPDATE projects SET name=%(project_name)s WHERE id = %(project_id)s
"""

GET_USER_PROJECTS = """
SELECT p.id, p.user_id, p.name, p.cloned_from, p.created_at, p.updated_at, c.count AS codespace_count
FROM projects p
LEFT JOIN
(SELECT count(*) AS count, project_id FROM codespaces GROUP BY project_id) c ON p.id = c.project_id
WHERE p.name != 'Playground'
AND p.name LIKE %(query_str)s
AND p.user_id = %(user_id)s
ORDER BY
"""

GET_OTHER_PROJECTS = """
SELECT p.id, p.user_id, p.name, p.cloned_from, p.created_at, p.updated_at, c.count AS codespace_count
FROM projects p
LEFT JOIN
(SELECT count(*) AS count, project_id FROM codespaces GROUP BY project_id) c ON p.id = c.project_id
WHERE p.name != 'Playground'
AND p.name LIKE %(query_str)s
AND p.user_id != %(user_id)s
ORDER BY
"""

GET_PROJECT_COUNT = """
SELECT * FROM 
(SELECT count(*) AS my_projects FROM projects
WHERE user_id = %(user_id)s) AS t1,
(SELECT count(*) AS other_projects FROM projects
WHERE user_id != %(user_id)s
AND name != 'Playground') AS t2
"""

INSERT_LAST_SELECTED_CODESPACE = """
INSERT INTO last_selected_codespace (user_id, codespace_id) VALUES (%(user_id)s, %(codespace_id)s)
ON DUPLICATE KEY UPDATE codespace_id = %(codespace_id)s
"""

GET_WORKSPACES = """
SELECT DISTINCT(user_id) FROM projects ORDER BY user_id
"""

GET_PROJECT_ID_AND_CODESPACE_ID_FROM_CODESPACE_PATH = """
SELECT p.id AS project_id, c.id AS codespace_id
FROM projects p JOIN codespaces c ON p.id = c.project_id
WHERE p.user_id = %(user_id)s AND p.name = %(project_name)s
AND c.name = %(codespace_name)s;
"""

GET_WORKSPACES_AND_CODESPACES = """
SELECT 
    projects.id AS project_id,
    projects.name AS project_name,
    codespaces.id AS codespace_id,
    codespaces.name AS codespace_name
FROM 
    codespaces
JOIN 
    projects ON codespaces.project_id = projects.id
WHERE 
    codespaces.cluster_id IS NOT NULL
    AND codespaces.cluster_id = %(cluster_id)s
"""
