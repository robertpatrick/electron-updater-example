This repo contains the **bare minimum code** to have an auto-updating Electron app using [`electron-updater`](https://github.com/electron-userland/electron-builder/tree/master/packages/electron-updater) with releases stored on GitHub.

If you can't use GitHub, you can use other providers:

- [Complete electron-updater HTTP example](https://gist.github.com/iffy/0ff845e8e3f59dbe7eaf2bf24443f104)
- [Complete electron-updater from gitlab.com private repo example](https://gist.github.com/Slauta/5b2bcf9fa1f6f6a9443aa6b447bcae05)

**NOTE:** If you want to run through this whole process, you will need to fork this repo on GitHub and replace all instances of `iffy` (or `robertpatrick`) with your GitHub username before doing the following steps.

1. For macOS, you will need a code-signing certificate.

    Install Xcode (from the App Store), then follow [these instructions](https://developer.apple.com/library/content/documentation/IDEs/Conceptual/AppDistributionGuide/MaintainingCertificates/MaintainingCertificates.html#//apple_ref/doc/uid/TP40012582-CH31-SW6) to make sure you have a "Mac Developer" certificate.  If you'd like to export the certificate (for automated building, for instance) [you can](https://developer.apple.com/library/content/documentation/IDEs/Conceptual/AppDistributionGuide/MaintainingCertificates/MaintainingCertificates.html#//apple_ref/doc/uid/TP40012582-CH31-SW7).  You would then follow [these instructions](https://www.electron.build/code-signing).

2. For MacOS, create a file named `.env` in the project base directory and add entries that look like the following.

```
APPLEID=<Apple Developer ID>
APPLEIDPASS=<Apple Developer ID Password or authentication token>
```

3. Adjust `package.json`, `electron-builder.yaml`, and `build/notarize.js`.

    By default, `electron-updater` will try to detect the GitHub settings (such as the repo name and owner) from reading the `.git/config` or from reading other attributes within `package.json`.  If the auto-detected settings are not what you want, configure the [`publish`](https://github.com/electron-userland/electron-builder/wiki/Publishing-Artifacts#PublishConfiguration) property as follows:

        {
            ...
            "build": {
                "publish": [{
                    "provider": "github",
                    "owner": "iffy",
                    "repo": "electron-updater-example"
                }],
                ...
            }
        }

4. Install necessary dependencies with:

        yarn

   or

        npm install

5. Generate a GitHub access token by going to <https://github.com/settings/tokens/new>.  The access token should have the `repo` scope/permission.  Once you have the token, assign it to an environment variable

    On macOS/linux:

        export GH_TOKEN="<YOUR_TOKEN_HERE>"

    On Windows, run in powershell:

        [Environment]::SetEnvironmentVariable("GH_TOKEN","<YOUR_TOKEN_HERE>","User")

    Make sure to restart IDE/Terminal to inherit latest env variable.

6. Publish for your platform with:

        electron-builder --config electron-builder.yaml -p always

   or

        npm run publish

   If you want to publish for more platforms, edit the `publish` script in `package.json`.  For instance, to build for Windows and macOS.  Note that signing/notarizing the MacOS app will only work when run on MacOS.

        ...
        "scripts": {
            "publish": "electron-builder --config electron-builder.yaml --mac --win -p always"
        },
        ...

7. Release the release on GitHub by going to <https://github.com/YOUR_GIT_HUB_USERNAME/electron-updater-example/releases>, editing the release and clicking "Publish release."

8. Download and install the app from <https://github.com/YOUR_GIT_HUB_USERNAME/electron-updater-example/releases>.

9. Update the version in `package.json`, commit and push to GitHub.

10. Do steps 6 and 7 again.

11. Open the installed version of the app and see that it updates itself.
