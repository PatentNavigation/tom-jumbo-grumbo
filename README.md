# tom-jumbo-grumbo

Package for releasing `node.js` projects to GitHub.

## Usage

`$ tp-release`
 
 Runs full release:
1. Generates release notes
2. Increments package.json version, commits, creates version tag, and pushes to git
3. Creates a new release on Github with release notes and tag version

`$ tp-release --skip-tag`

Runs the release but skips incrementing package.json version, committing, and creating version tag. Still creates release on Github with release notes.

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
