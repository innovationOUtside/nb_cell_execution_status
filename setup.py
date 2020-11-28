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
    version='0.0.4',
    include_package_data=True,
    install_requires=[
        'notebook', 'jupyter_nbextensions_configurator'
    ],
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
