import setuptools

setuptools.setup(
    name="nb_cell_execution_status",
    packages=['cell_execution_status'],
    version='0.0.3',
    include_package_data=True,
    install_requires=[
        'notebook', 'jupyter_nbextensions_configurator'
    ],
    data_files=[
        # like `jupyter nbextension install --sys-prefix`
        ("share/jupyter/nbextensions/cell_execution_status", [
            "cell_execution_status/static/index.js",
             "cell_execution_status/static/cell_execution_status.yaml",
             "cell_execution_status/static/main.css",
             "cell_execution_status/static/cell_status.png",
              "cell_execution_status/static/README.md"
        ]),
        # like `jupyter nbextension enable --sys-prefix`
        ("etc/jupyter/nbconfig/notebook.d", [
            "jupyter-config/nbconfig/notebook.d/cell_execution_status.json"
        ])
    ],
    zip_safe=False
)