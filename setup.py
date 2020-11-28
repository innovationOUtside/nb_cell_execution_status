import setuptools

setuptools.setup(
    name="nb_cell_execution_status",
    packages=['cell_execution_status'],
    version='0.0.4',
    include_package_data=True,
    install_requires=[
        'notebook', 'jupyter_nbextensions_configurator'
    ],
    include_package_data=True,
    package_data={
        "cell_execution_status": [
             "static/index.js",
            "static/cell_execution_status.yaml",
            "static/cell_status.png",
            "static/main.css",
            "static/README.md"
         ],
    },
    zip_safe=False
)
