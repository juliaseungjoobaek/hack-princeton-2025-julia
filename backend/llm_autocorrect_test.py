from llm_autocorrect import LLMAutocorrectWord
import os

def test_places():
    places = [
        "Par",
        "United sta",
        "Tok",
        "Ita",
        "Austra",
        "Machu Pic",
        "Icel",
        "New Yor",
        "The Serenge",
        "Santori"
    ]
    for indx in range(len(places)):
        places[indx] = places[indx].upper()
    llm = LLMAutocorrectWord(os.getenv('GEMINI_API'))
    results = [llm.send(place) for place in places]
    print(results)


def test_names():
    pass

def test_objects():
    pass