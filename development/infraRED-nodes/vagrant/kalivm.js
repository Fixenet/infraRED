const fs = require('fs');
const { exec } = require('node:child_process');

function awaitCommand(cmd, directory) {
    return new Promise((resolve, reject) => {
        exec(cmd, {'cwd': __dirname + directory, 'encoding': 'utf-8'}, (error,stdout,stderr) => {
            if(error) {
                if (error.message.includes('already exists.')) {
                    console.log(`Directory already exists.`);
                    resolve();
                    return;
                }
                console.log(error);
                reject(error);
                return;
            }
            if(stderr) {
                console.log(stderr);
                reject(stderr);
                return;
            }
            console.log(stdout);
            resolve();
        });
    });
}

module.exports = function() {
    function KaliVM() {
        this.category = {
            name: 'Vagrant',
            img: 'icons\\computer.svg',
        };

        this.properties = {
            vm_name: 'Not Kali Machine',
            cpus: '1',
            ram: '1024',
        };
    
        this.capabilities = {
            os: {

            },
            synced_folder: {
                vm_folder: '/shared',
                host_folder: '/shared',
            }
        };
            
        this.requirements = {
            storage: {
                mount_point: null,
            },
        };

        this.deploy = async function() {
            let idName = this.properties.vm_name.toLowerCase().replace(/\s/g, '');
            let directory = `\\boxes\\${idName}`;
            await awaitCommand(`mkdir .${directory}`, '');
            await new Promise((resolve, reject) => {
                fs.writeFile(__dirname + directory + '/Vagrantfile', '', (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });
            console.log('------------------------ Created Vagrantfile.');
            
            let content = 'Vagrant.configure("2") do |config|\n';
            content += '\tconfig.vm.box = "minimal/xenial64"\n';
            content += `\tconfig.vm.define "${idName}"\n`;
            content += `\tconfig.vm.synced_folder "${this.capabilities.synced_folder.host_folder}", "${this.capabilities.synced_folder.vm_folder}", create: true\n`;
            content += '\tconfig.vm.provider "virtualbox" do |vb|\n';
            content += '\t\tvb.gui = true\n';
            content += `\t\tvb.name = "${this.properties.vm_name}"\n`;
            content += `\t\tvb.memory = "${this.properties.ram}"\n`;
            content += `\t\tvb.cpus = ${this.properties.cpus}\n`;
            content += '\tend\nend';
            
            await new Promise((resolve, reject) => {
                fs.writeFile(__dirname + directory + '/Vagrantfile', content, (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });
            console.log('------------------------ Wrote Vagrantfile.');
            await awaitCommand('vagrant up', directory);
            console.log('------------------------ Deployed Machine.');
        };

        this.clean = async function() {
            let idName = this.properties.vm_name.toLowerCase().replace(/\s/g, '');
            let directory = `\\boxes\\${idName}`;
            await awaitCommand('vagrant destroy --force', directory);
            console.log('------------------------ Suspended machine.');
            await awaitCommand(`rmdir /S /Q .${directory}`, '');
        };
    }

    return {
        create: function() {
            return new KaliVM();
        },
        load: async function() {

        },
    };
}();