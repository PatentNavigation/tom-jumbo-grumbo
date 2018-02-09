# tom-jumbo-grumbo

Package for releasing `node.js` projects to GitHub.

## Usage

* `$ tp-release`

## Github API access

Putting the changelog in the release automatically require GitHub API access.
You can do it manually (`tp-release` will print instructions), but if you want
it done automatically, here are the steps to follow:

* Create a personal access token using [these instructions](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/). Make sure to enable the `repo` scope.
* Create a file called `~/.tom-jumbo-grumbo` that looks like this:

```json
{
  "githubAccessToken": "<your access token>"
}
```
