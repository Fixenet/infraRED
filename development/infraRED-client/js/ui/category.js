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
            return true;
        } else {
            selectedCategory.toggleClass('category-selected');
            selectedCategory = category;
            category.toggleClass('category-selected');
            return true;
        }
    }

    function createNewCategory(name) {
        let newCategory = $('<img>', {
            id: `${name}-category`,
            class: 'category',
            alt: `${name} Category`,

            //TODO - How to generate this ?
            src: './icons/computer-svgrepo-com.svg',
        });

        newCategory.on('click', function() {
            if (toggleCategory(newCategory)) {
                infraRED.editor.statusBar.log(`${name}!`);
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

            let nodeCategory = createNewCategory("node");
            content.append(nodeCategory);

            let node1Category = createNewCategory("node1");
            content.append(node1Category);
        },
        get: function() {
            return categoryBar;
        },
    };
})();