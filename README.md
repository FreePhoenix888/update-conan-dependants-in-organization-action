# Inputs

| **Name**                  	| **Descirption**                                                                                                                                                	| **Required** 	| **Default** 	|
|---------------------------	|----------------------------------------------------------------------------------------------------------------------------------------------------------------	|--------------	|-------------	|
| token                     	| The github access token                                                                                                                                        	| true         	|             	|
| organizationName          	| The name of the organization whose repositories must be updated to change the conan dependency version.                                                        	| true         	|             	|
| conanFilePath             	| The path of the conanfile.txt in organization repositories.                                                                                                    	| true         	|             	|
| commitMessage             	| The commit message that will be used to update conanfile.txt.                                                                                                  	| true         	|             	|
| sourceBranchName          	| The name of the branch that will be taken as the basis.                                                                                                        	| true         	|             	|
| destinationBranchName     	| The name of the branch that will be used to publish the new commit.                                                                                            	| true         	|             	|
| conanFileReplaceableRegex 	| The regex that will be replaced in the conanfile.txt.                                                                                                          	| true         	|             	|
| conanFileReplacement      	| The text that will be inserted instead of the replaceable regex.                                                                                               	| true         	|             	|
| shouldOpenPullRequest     	| true or false value that determines whether the pull request should be opened. Redundant if the destination branch name is the same as the source branch name. 	| false        	| "true"      	|
| pullRequestTitle          	| The title of the pull request that will be opened.                                                                                                             	| false        	|             	|
| pullRequestBody           	| The body of the pull request that will be opened.                                                                                                              	| false        	|             	|
