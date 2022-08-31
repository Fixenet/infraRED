//use this file to define the category bar
infraRED.editor.categoryBar = (function() {
    let categoryBar, content;

    let selectedCategory = null;
    function toggleCategory(category) {
        if (selectedCategory == category) {
            return false;
        } else if (selectedCategory == null) { //first time selecting a category
            selectedCategory = category;
            selectedCategory.toggleClass('category-selected');
            infraRED.events.emit('category:change-category', null, selectedCategory.attr("name"));
            return true;
        } else {
            selectedCategory.toggleClass('category-selected');
            infraRED.events.emit('category:change-category', selectedCategory.attr("name"), category.attr("name"));
            selectedCategory = category;
            category.toggleClass('category-selected');
            return true;
        }
    }

    function createNewCategory(name, img) {
        let idName = name.toLowerCase().replaceAll(' ','');
        let newCategory = $('<img>', {
            id: `${idName}-category`,
            class: 'category',
            alt: `${idName} Category`,
            src: img,
        });

        newCategory.attr("name", name);

        newCategory.on('click', function() {
            if (toggleCategory(newCategory)) {
                infraRED.editor.statusBar.log(`${name} is now showing!`);
            }
        });

        return newCategory;
    }

    return {
        init: function() {
            console.log('%cCreating Category Bar...', 'color: #fd9694');

            categoryBar = $('#infraRED-ui-category-bar');

            content = $('<div>', {
                id: 'category-bar-content',
                class: 'content',
            });
            categoryBar.append(content);

            let nodesList = infraRED.nodes.resourceList.getAll();

            let categoryList = [];
            let newCategory;
            for (let node of nodesList) {
                if (categoryList.indexOf(node.category.name) == -1) {
                    newCategory = createNewCategory(node.category.name, node.category.img);
                    content.append(newCategory);
                    categoryList.push(node.category.name);
                }
            }
            //automatically open a category section (last one)
            toggleCategory(newCategory);

            //add the saved patterns category
            let saves = createNewCategory('Saved Patterns', 'icons\\floppy_disk.svg');
            content.append(saves);
        },
        get: function() {
            return categoryBar;
        },
    };
})();