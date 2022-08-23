module.exports = function() {
    function Compute() {
        this.category = {
            name: 'Computation',
            img: 'icons\\arrow-svgrepo-com.svg',
        };

        //outline what properties this node has
        this.properties = {
            name: '',
            ip: '192.168.1.2',
            port: '6000',
        };
    
        this.capabilities = {
        };
            
        this.requirements = {
            storage: {
                mount_point: null,
            },
        };

        this.deploy = async function() {
            console.log(`-Booting up compute node at ${this.properties.ip}:${this.properties.port}.`);
            await new Promise(r => setTimeout(r, 2000));
            console.log(`-Straping to storage on mount point: ${this.requirements.storage.mount_point}.`);
            await new Promise(r => setTimeout(r, 1000));
            console.log('-Finished boot up.');
        };

        this.clean = async function() {
            console.log('-Cleaning myself.');
            await new Promise(r => setTimeout(r, 1000));
            console.log('-Shutting down.');
        };
    }

    return {
        create: function() {
            return new Compute();
        },
        load: async function() {
            //TEST - instant load
        },
    };
}();