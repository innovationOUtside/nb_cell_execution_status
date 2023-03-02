from setuptools import setup

from os import path

def get_long_description():
    with open(
        path.join(path.dirname(path.abspath(__file__)), "README.md"),
        encoding="utf8",
    ) as fp:
        return fp.read()


setup(
    name="nb_cell_execution_status",
    url="https://github.com/innovationOUtside/nb_cell_execution_status",
    author='Tony Hirst',
    author_email='tony.hirst@open.ac.uk',
    description='Classic Jupyter notebook cell execution status',
    long_description=get_long_description(),
    long_description_content_type="text/markdown",
    packages=['cell_execution_status'],
    version='0.0.6',
    include_package_data=True,
    install_requires=[
        'jupyter_nbextensions_configurator'
    ],
    data_files=[
        # like `jupyter nbextension install --sys-prefix`
        ("share/jupyter/nbextensions/cell_execution_status", [
            "cell_execution_status/static/index.js",
            "cell_execution_status/static/cell_execution_status.yaml",
            "cell_execution_status/static/cell_status.png",
            "cell_execution_status/static/main.css",
            "cell_execution_status/static/README.md"
        ]),
        # like `jupyter nbextension enable --sys-prefix`
        ("etc/jupyter/nbconfig/notebook.d", [
            "jupyter-config/nbconfig/notebook.d/cell_execution_status.json"
        ])
    ],
    zip_safe=False
)
