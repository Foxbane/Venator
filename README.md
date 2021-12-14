Venator (Latin for hunter) is a desktop application design to analysis of
suspected malicious secure and easy.

By utilising docker and REMnux distro the process of setting up a secure
environment with the correct tools is made easy.

Based on the electron framework the app provides a user-friendly interface to
upload files, select test types and retrieve results.

**Requirements**

-   Venator will run on any environment that supports the electron framework.
    Details can be found in this
    [documentation](https://www.electronjs.org/docs/latest/tutorial/support#supported-platforms)

-   Docker for windows must be installed prior to launch and can be found
    [here](https://docs.docker.com/desktop/windows/install/)

-   Latest REMnux image must be available to run any analysis

**Note:** Venator is currently only available for windows bases systems.

**User guide.**

-   The venator works by spinning up a docker container of the [REMnux
    distro](https://remnux.org) to take advantage of its malware analysis
    toolkit. As such we strongly recommend checking out their documentation for
    further details on any of the test mentioned or used within this
    application.

-   An initial file must be uploaded to the application and the environment
    setup. This creates a temporary container and passes the file to this
    system. Please note that while any file type is support certain tests may
    not support these file types.

-   Once the environment is setup select the appropriate test from the dropdown
    and run the test.

-   Once completed, you may select to view the results which will display in
    basic text format in textpad.

-   All output files are stored within the app folder under output in the format
    ‘filetitle’_output.txt.

**Available Tests.**

Below is a list of the current tests that are offered by Venator, with a brief
description and link to any relevant documentation

-   [Exiftool](https://exiftool.org/): This tool extracts metadata from any file
    type, useful when analysing images.

-   [Zipdump](https://blog.didierstevens.com/2020/07/27/update-zipdump-py-version-0-0-20/).py:
    Extracts the directory of a zip file for analysis

-   [Diec](https://github.com/horsicq/Detect-It-Easy): Detect-it-easy,
    identifies the file type, useful for analysis of working PE files.
