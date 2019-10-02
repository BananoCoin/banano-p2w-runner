### to force only one version of banano-p2w-runner

rm -rf .git;
git init;
find . -exec touch {} \;
git add .;
git commit -m "Initial commit";
git remote add origin https://github.com/bananocoin/banano-p2w-runner.git;
git push -u --force origin master;
git branch --set-upstream-to=origin/master master;
git pull;
git push;
