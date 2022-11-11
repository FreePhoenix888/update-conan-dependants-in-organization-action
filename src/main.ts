import * as core from '@actions/core';
import * as github from "@actions/github";
import {Base64} from "js-base64";

const run = async () => {
    const context = github.context;

    const requiredInputNames = [
        "token",
        "organizationName",
        "conanFilePath",
        "commitMessage",
        "sourceBranchName",
        "destinationBranchName",
        "replaceableRegex",
        "replacement",
    ];

    const inputs = {
        token: core.getInput("token"),
        conanFilePath: core.getInput("conanFilePath"),
        commitMessageTemplate: core.getInput("commitMessageTemplate"),
        sourceBranchName: core.getInput("sourceBranchName"),
        destinationBranchName: core.getInput("destinationBranchName"),
        conanFileReplaceableRegex: core.getInput("conanFileReplaceableRegex"),
        conanFileReplacement: core.getInput("conanFileReplacement"),
        shouldOpenPullRequest: core.getInput("shouldOpenPullRequest"),
        pullRequestTitle: core.getInput("pullRequestTitle"),
        pullRequestBody: core.getInput("pullRequestBody"),
    }

    for (const requiredInputName of requiredInputNames) {
        const value = inputs[requiredInputName as keyof typeof inputs];
        if (value == "" || value == undefined) {
            throw new Error(`${requiredInputName} input is required.`);
        }
    }

    const octokit = github.getOctokit(inputs.token)

    const {data: repositories} = await octokit.rest.repos.listForOrg({org: context.repo.owner});
    for (const repository of repositories) {
        let content;
        try {
            const getContentResponse = await octokit.rest.repos.getContent({
                owner: context.repo.owner,
                repo: repository.name,
                path: inputs.conanFilePath,
                ref: inputs.sourceBranchName
            });
            if (Array.isArray(getContentResponse.data)) {
                throw new Error("conanFilePath must lead to the conanfile.txt that contains conan dependencies.");
            }
            if (!("content" in getContentResponse.data)) {
                throw new Error(`Unable to get content of ${inputs.conanFilePath}.`);
            }
            content = getContentResponse.data.content
        } catch (error) {
            continue
        }


        const regex = new RegExp(inputs.conanFileReplaceableRegex);
        const match = regex.exec(content);
        if(!match) {
            continue;
        }
        const newContent = Base64.decode(
            content
        ).replace(content
            , inputs.conanFileReplacement
        );

        if(inputs.sourceBranchName != inputs.destinationBranchName) {
            const {data: {commit: {sha: sourceBranchSha}}} = await octokit.rest.repos.getBranch({
                owner: context.repo.owner,
                repo: repository.name,
                branch: inputs.sourceBranchName
            });

            await octokit.rest.git.createRef({
                owner: context.repo.owner,
                repo: repository.name,
                ref: `refs/heads/${inputs.destinationBranchName}`,
                sha: sourceBranchSha
            })
        }

        let commitMessage = inputs.commitMessageTemplate;
        if(match?.groups?.PREVIOUS_VERSION) {
            commitMessage = inputs.commitMessageTemplate.replace("{PREVIOUS_VERSION}", match.groups.PREVIOUS_VERSION)
        }

         await octokit.rest.repos.createOrUpdateFileContents({
            owner: context.repo.owner,
            repo: repository.name,
            path: inputs.conanFilePath,
            message: commitMessage,
            content: Base64.encode(newContent),
            branch: inputs.destinationBranchName
        })

        if(inputs.sourceBranchName != inputs.destinationBranchName && inputs.shouldOpenPullRequest) {
            await octokit.rest.pulls.create({
                owner: context.repo.owner,
                repo: repository.name,
                title: inputs.pullRequestTitle,
                body: inputs.pullRequestBody,
                head: `${context.repo.owner}:${inputs.destinationBranchName}`,
                base: inputs.sourceBranchName
            })
        }
    }
}

run()
    .catch(error => core.setFailed(error));

