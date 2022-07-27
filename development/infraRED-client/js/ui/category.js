// use this file to define the category bar
infraRED.editor.categoryBar = (function() {
    let categoryBar;

    let selectedCategory = null;
    function toggleCategory(category) {
        if (selectedCategory == category) {
            return false;
        } else if (selectedCategory == null) { // first time selecting a category
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
        let newCategory = $('<img>', {
            id: `${name}-category`,
            class: 'category',
            alt: `${name} Category`,
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

            let content = $('<div>', {
                id: 'category-bar-content',
                class: 'content',
            });
            categoryBar.append(content);

            let nodesList = infraRED.nodes.resourceList.getAll();

            let categoryList = [];
            for (let node of nodesList) {
                if (categoryList.indexOf(node.properties.category.name) == -1) {
                    let newCategory = createNewCategory(node.properties.category.name, node.properties.category.img);
                    content.append(newCategory);
                    categoryList.push(node.properties.category.name);
                }
            }
        },
        get: function() {
            return categoryBar;
        },
    };
})();