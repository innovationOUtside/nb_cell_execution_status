# nb\_cell\_execution\_status
Indicators relating to cell execution status


[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/innovationOUtside/nb_cell_execution_status/master)


Use colour to display cell execution status of notebook code cells:

- *white*: not executed
- *light cyan*: awaiting execution
- *green*: successfully executed
- *pink*: failed

![](.images/cell_status.png)


Visual cell execution status indicators are based on the cell exeustion status indicators found in the  [`lc_multi_outputs`](https://github.com/NII-cloud-operation/Jupyter-multi_outputs) python package (via `NII-cloud-operation/Jupyter-multi_outputs`).

Audible feedback for successful and unsuccessful cell completion can also be enabled from the notebook extension confugrator menu:

![](.images/cell-execution_config.png)

There is also an optional heartbeat pulse (default period 5s; configurable) that can be used to indicate the continuning run status of long running cells.

## Installation

Install via:

`pip install --upgrade git+https://github.com/innovationOUtside/nb_cell_execution_status.git`

The extension should be automatically installed and enabled.

If you need to do things manually:


```
jupyter nbextension uninstall cell_execution_status
jupyter nbextension install cell_execution_status --user
jupyter nbextension enable cell_execution_status/index
```
