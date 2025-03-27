document.addEventListener("DOMContentLoaded", () => {
    const quoteList = document.getElementById("quote-list");
    const quoteForm = document.getElementById("new-quote-form");
    const sortButton = document.getElementById("sort-button");
    let sorted = false;

    const fetchQuotes = () => {
        fetch("http://localhost:3000/quotes?_embed=likes")
            .then(response => response.json())
            .then(renderQuotes);
    };

    const renderQuotes = (quotes) => {
        quoteList.innerHTML = "";
        if (sorted) {
            quotes.sort((a, b) => a.author.localeCompare(b.author));
        }
        quotes.forEach(renderQuote);
    };

    const renderQuote = (quote) => {
        const li = document.createElement("li");
        li.classList.add("quote-card");
        li.innerHTML = `
            <blockquote class="blockquote">
                <p class="mb-0">${quote.quote}</p>
                <footer class="blockquote-footer">${quote.author}</footer>
                <br>
                <button class='btn-success'>Likes: <span>${quote.likes.length}</span></button>
                <button class='btn-danger'>Delete</button>
                <button class='btn-edit'>Edit</button>
            </blockquote>
        `;
        li.querySelector(".btn-danger").addEventListener("click", () => deleteQuote(quote.id, li));
        li.querySelector(".btn-success").addEventListener("click", () => likeQuote(quote.id, li));
        li.querySelector(".btn-edit").addEventListener("click", () => editQuote(quote, li));
        quoteList.appendChild(li);
    };

    const addQuote = (event) => {
        event.preventDefault();
        const newQuote = {
            quote: quoteForm["new-quote"].value,
            author: quoteForm["author"].value,
            likes: []
        };
        fetch("http://localhost:3000/quotes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newQuote)
        })
            .then(response => response.json())
            .then(renderQuote);
        quoteForm.reset();
    };

    const deleteQuote = (id, element) => {
        fetch(`http://localhost:3000/quotes/${id}`, { method: "DELETE" })
            .then(() => element.remove());
    };

    const likeQuote = (quoteId, element) => {
        fetch("http://localhost:3000/likes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quoteId, createdAt: Date.now() })
        })
            .then(response => response.json())
            .then(() => {
                const likeCount = element.querySelector(".btn-success span");
                likeCount.textContent = parseInt(likeCount.textContent) + 1;
            });
    };

    const editQuote = (quote, element) => {
        const newQuoteText = prompt("Edit Quote:", quote.quote);
        if (newQuoteText) {
            fetch(`http://localhost:3000/quotes/${quote.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quote: newQuoteText })
            })
                .then(response => response.json())
                .then(updatedQuote => {
                    element.querySelector(".mb-0").textContent = updatedQuote.quote;
                });
        }
    };

    sortButton.addEventListener("click", () => {
        sorted = !sorted;
        fetchQuotes();
    });

    quoteForm.addEventListener("submit", addQuote);
    fetchQuotes();
});
