const fs = require('fs');

module.exports = function() {
    function KaliVM() {
        this.category = {
            name: 'Vagrant',
            img: 'icons\\computer-svgrepo-com.svg',
        };

        this.properties = {
            vm_name: 'Kali Machine',
            cpus: '1',
            ram: '1024',
        };
    
        this.capabilities = {
            os: {

            },
            synced_folder: {
                vm_folder: null,
                host_folder: null,
            }
        };
            
        this.requirements = {
            storage: {
                mount_point: null,
            },
        };

        this.deploy = async function() {
            //do vagrant up
        };

        this.clean = async function() {
            //do vagrant destroy
        };
    }

    return {
        create: function() {
            return new KaliVM();
        },
        load: async function() {
            //create/load the Vagrantfile
            let content = 'Vagrant.configure("2") do |config|\n';
            fs.writeFile(__dirname + '/Vagrantfile', content, (err) => {
                if (err) throw Error('Could not create Vagrantfile.');
            });
        },
    };
}();